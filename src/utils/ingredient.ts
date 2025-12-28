/**
 * 食材分类工具
 */

export interface IngredientCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
}

// 食材分类配置（与后端 ingredient_categories 表对齐）
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  { key: 'meat', label: '肉禽类', icon: '🥩', color: '#e8503a' },
  { key: 'seafood', label: '水产海鲜', icon: '🦐', color: '#2980b9' },
  { key: 'vegetable', label: '蔬菜', icon: '🥬', color: '#27ae60' },
  { key: 'mushroom', label: '菌菇', icon: '🍄', color: '#8b5a2b' },
  { key: 'tofu', label: '豆制品', icon: '🧈', color: '#f4a261' },
  { key: 'egg_dairy', label: '蛋奶', icon: '🥚', color: '#f39c12' },
  { key: 'seasoning', label: '调味料', icon: '🧂', color: '#8d6e63' },
  { key: 'sauce', label: '酱料', icon: '🫙', color: '#a0522d' },
  { key: 'spice', label: '香辛料', icon: '🌶️', color: '#c0392b' },
  { key: 'oil', label: '油脂', icon: '🫒', color: '#d4a017' },
  { key: 'staple', label: '主食', icon: '🍚', color: '#d35400' },
  { key: 'dry_goods', label: '干货', icon: '🫘', color: '#9b59b6' },
  { key: 'nut', label: '坚果', icon: '🥜', color: '#cd853f' },
  { key: 'fruit', label: '水果', icon: '🍎', color: '#e74c3c' },
  { key: 'other', label: '其他', icon: '📦', color: '#78909c' },
];

// 分类映射缓存
const categoryMap = new Map(INGREDIENT_CATEGORIES.map(c => [c.key, c]));
const otherCategory = INGREDIENT_CATEGORIES.find(c => c.key === 'other')!;

/**
 * 根据分类 key 获取分类配置
 */
export function getCategoryByKey(key: string): IngredientCategory | undefined {
  return categoryMap.get(key);
}

/**
 * 获取食材分类
 * @param categoryKey 后端返回的分类 key
 */
export function getIngredientCategory(
  categoryKey?: string | null
): IngredientCategory {
  if (categoryKey) {
    const category = categoryMap.get(categoryKey);
    if (category) return category;
  }
  return otherCategory;
}

/**
 * 解析数量字符串，提取数值和单位
 */
export function parseQuantity(text: string): {
  value: number | null;
  unit: string;
} {
  const match = text.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].trim(),
    };
  }
  return { value: null, unit: text };
}

/**
 * 合并同类食材的数量
 */
export function mergeQuantities(
  quantities: Array<{ quantity: string; recipeName: string; servings: number }>
): { total: string; breakdown: typeof quantities } {
  const parsed = quantities.map(q => ({
    ...q,
    ...parseQuantity(q.quantity),
  }));

  const units = new Set(parsed.map(p => p.unit));
  const allNumeric = parsed.every(p => p.value !== null);

  if (allNumeric && units.size === 1) {
    const totalValue = parsed.reduce((sum, p) => sum + (p.value || 0), 0);
    const unit = parsed[0].unit;
    const total = `${totalValue % 1 === 0 ? totalValue : totalValue.toFixed(1)}${unit}`;
    return { total, breakdown: quantities };
  }

  return {
    total: quantities.map(q => q.quantity).join(' + '),
    breakdown: quantities,
  };
}
