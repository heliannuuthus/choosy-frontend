/**
 * 食材分类工具
 */

export interface IngredientCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
}

// 食材分类配置
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  {
    key: 'meat',
    label: '肉类',
    icon: '🥩',
    color: '#e8503a',
    keywords: [
      '肉',
      '排骨',
      '五花',
      '里脊',
      '鸡',
      '鸭',
      '鹅',
      '牛',
      '羊',
      '猪',
      '腊肠',
      '火腿',
      '培根',
      '肥牛',
      '肥羊',
      '腱子',
      '牛腩',
      '猪蹄',
      '鸡腿',
      '鸡翅',
      '鸡胸',
      '鸡爪',
      '鸭腿',
      '鸭脖',
      '肉末',
      '肉片',
      '肉丝',
      '肉馅',
      '腊肉',
      '午餐肉',
      '香肠',
    ],
  },
  {
    key: 'seafood',
    label: '海鲜水产',
    icon: '🦐',
    color: '#2980b9',
    keywords: [
      '鱼',
      '虾',
      '蟹',
      '贝',
      '蛤',
      '蚝',
      '海参',
      '鱿鱼',
      '墨鱼',
      '章鱼',
      '扇贝',
      '蛏子',
      '花蛤',
      '海带',
      '紫菜',
      '海苔',
      '鳗鱼',
      '三文鱼',
      '龙虾',
      '螃蟹',
      '蚬',
      '鲍鱼',
      '海蜇',
      '银鱼',
      '带鱼',
      '黄鱼',
      '鲈鱼',
      '草鱼',
      '鲤鱼',
      '鲫鱼',
      '鳊鱼',
      '桂鱼',
      '鳜鱼',
    ],
  },
  {
    key: 'vegetable',
    label: '蔬菜',
    icon: '🥬',
    color: '#27ae60',
    keywords: [
      '菜',
      '白菜',
      '青菜',
      '生菜',
      '油菜',
      '芹菜',
      '韭菜',
      '菠菜',
      '茄子',
      '土豆',
      '番茄',
      '西红柿',
      '黄瓜',
      '豆角',
      '四季豆',
      '青椒',
      '辣椒',
      '洋葱',
      '胡萝卜',
      '萝卜',
      '莲藕',
      '山药',
      '南瓜',
      '冬瓜',
      '苦瓜',
      '丝瓜',
      '西葫芦',
      '芦笋',
      '竹笋',
      '豌豆',
      '毛豆',
      '玉米',
      '蘑菇',
      '香菇',
      '金针菇',
      '平菇',
      '杏鲍菇',
      '木耳',
      '银耳',
      '花菜',
      '西兰花',
      '空心菜',
      '豆芽',
      '莴笋',
      '蒜苗',
      '蒜薹',
      '娃娃菜',
      '包菜',
      '卷心菜',
      '紫甘蓝',
    ],
  },
  {
    key: 'tofu',
    label: '豆制品',
    icon: '🧈',
    color: '#f4a261',
    keywords: [
      '豆腐',
      '豆干',
      '豆皮',
      '腐竹',
      '豆腐干',
      '千张',
      '油豆腐',
      '臭豆腐',
      '豆腐泡',
      '素鸡',
      '豆浆',
      '纳豆',
      '腐乳',
      '豆渣',
    ],
  },
  {
    key: 'egg',
    label: '蛋奶',
    icon: '🥚',
    color: '#f39c12',
    keywords: [
      '鸡蛋',
      '蛋',
      '鸭蛋',
      '鹌鹑蛋',
      '皮蛋',
      '咸蛋',
      '蛋黄',
      '蛋白',
      '牛奶',
      '奶油',
      '黄油',
      '芝士',
      '奶酪',
      '淡奶油',
      '鲜奶油',
      '奶粉',
      '酸奶',
      '炼乳',
    ],
  },
  {
    key: 'seasoning',
    label: '调味料',
    icon: '🧂',
    color: '#8d6e63',
    keywords: [
      '盐',
      '糖',
      '酱油',
      '醋',
      '料酒',
      '味精',
      '鸡精',
      '蚝油',
      '生抽',
      '老抽',
      '豆瓣酱',
      '辣椒酱',
      '番茄酱',
      '芝麻酱',
      '花生酱',
      '沙拉酱',
      '蒜蓉',
      '姜',
      '蒜',
      '葱',
      '香菜',
      '花椒',
      '八角',
      '桂皮',
      '香叶',
      '小茴香',
      '大料',
      '草果',
      '白胡椒',
      '黑胡椒',
      '五香粉',
      '十三香',
      '咖喱',
      '孜然',
      '辣椒粉',
      '辣椒面',
      '豆豉',
      '陈皮',
      '芥末',
      '酒酿',
      '米醋',
      '香醋',
      '白醋',
      '冰糖',
      '红糖',
      '白砂糖',
      '蜂蜜',
      '淀粉',
      '生粉',
      '玉米淀粉',
      '红薯淀粉',
      '面粉',
      '糯米粉',
      '干辣椒',
      '小米辣',
      '二荆条',
      '朝天椒',
    ],
  },
  {
    key: 'staple',
    label: '主食',
    icon: '🍚',
    color: '#d35400',
    keywords: [
      '米',
      '大米',
      '糯米',
      '面',
      '面条',
      '挂面',
      '意面',
      '粉丝',
      '米粉',
      '河粉',
      '饺子皮',
      '馄饨皮',
      '春卷皮',
      '馒头',
      '面包',
      '年糕',
      '红薯',
      '芋头',
      '土豆',
      '玉米',
      '燕麦',
      '小米',
      '黑米',
      '紫米',
      '薏米',
      '红豆',
      '绿豆',
      '黑豆',
      '黄豆',
      '花生',
      '核桃',
      '杏仁',
      '腰果',
      '开心果',
      '芝麻',
      '葡萄干',
    ],
  },
  {
    key: 'other',
    label: '其他',
    icon: '📦',
    color: '#78909c',
    keywords: [],
  },
];

// 分类映射表，用于快速查找
const categoryMap = new Map<string, IngredientCategory>();
INGREDIENT_CATEGORIES.forEach(cat => {
  categoryMap.set(cat.key, cat);
});

/**
 * 根据分类 key 获取分类信息（从后端获取）
 */
export function getIngredientCategory(
  categoryKey?: string | null
): IngredientCategory {
  if (categoryKey && categoryMap.has(categoryKey)) {
    return categoryMap.get(categoryKey)!;
  }
  return categoryMap.get('other')!;
}

/**
 * 根据食材名称判断分类（已废弃，保留用于兼容）
 * @deprecated 请使用后端返回的 category 字段
 */
export function getIngredientCategoryByName(name: string): IngredientCategory {
  const lowerName = name.toLowerCase();

  for (const category of INGREDIENT_CATEGORIES) {
    if (category.key === 'other') continue;

    for (const keyword of category.keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }

  return categoryMap.get('other')!;
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
  // 尝试解析并合并数值
  const parsed = quantities.map(q => ({
    ...q,
    ...parseQuantity(q.quantity),
  }));

  // 检查是否所有数量都有相同单位且可合并
  const units = new Set(parsed.map(p => p.unit));
  const allNumeric = parsed.every(p => p.value !== null);

  if (allNumeric && units.size === 1) {
    const totalValue = parsed.reduce((sum, p) => sum + (p.value || 0), 0);
    const unit = parsed[0].unit;
    const total = `${totalValue % 1 === 0 ? totalValue : totalValue.toFixed(1)}${unit}`;
    return { total, breakdown: quantities };
  }

  // 无法合并，返回第一个作为展示
  return {
    total: quantities.map(q => q.quantity).join(' + '),
    breakdown: quantities,
  };
}
