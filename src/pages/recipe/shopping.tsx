import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon, AtActivityIndicator } from 'taro-ui';
import { getRecipeDetail, RecipeDetail } from '../../services/recipe';
import './shopping.scss';

const COOKING_LIST_KEY = 'cooking_list';

interface CookingListItem {
  id: string;
  name: string;
  servings: number;
}

interface MergedIngredient {
  name: string;
  items: Array<{
    recipeName: string;
    quantity: string;
    servings: number;
  }>;
  checked: boolean;
}

const getCookingList = (): CookingListItem[] => {
  try {
    const data = Taro.getStorageSync(COOKING_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const ShoppingPage = () => {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<
    Array<{ detail: RecipeDetail; servings: number }>
  >([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadRecipeDetails = async () => {
      const cookingList = getCookingList();

      if (cookingList.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const details = await Promise.all(
          cookingList.map(async item => {
            const detail = await getRecipeDetail(item.id);
            return { detail, servings: item.servings };
          })
        );
        setRecipes(details);
      } catch (error) {
        console.error('加载菜谱详情失败:', error);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };

    loadRecipeDetails();
  }, []);

  const mergedIngredients = useMemo(() => {
    const ingredientMap = new Map<string, MergedIngredient>();

    recipes.forEach(({ detail, servings }) => {
      const ratio = servings / detail.servings;

      detail.ingredients.forEach(ing => {
        const key = ing.name;
        const existing = ingredientMap.get(key);

        let quantityText = ing.text_quantity;
        if (ing.quantity && ratio !== 1) {
          const scaledQty = ing.quantity * ratio;
          quantityText = `${scaledQty % 1 === 0 ? scaledQty : scaledQty.toFixed(1)}${ing.unit || ''}`;
        }

        if (existing) {
          existing.items.push({
            recipeName: detail.name.replace(/的做法$/, ''),
            quantity: quantityText,
            servings,
          });
        } else {
          ingredientMap.set(key, {
            name: key,
            items: [
              {
                recipeName: detail.name.replace(/的做法$/, ''),
                quantity: quantityText,
                servings,
              },
            ],
            checked: false,
          });
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-CN')
    );
  }, [recipes]);

  const toggleCheck = useCallback((name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  // 分离未勾选和已勾选的食材
  const { uncheckedIngredients, checkedIngredients } = useMemo(() => {
    const unchecked: typeof mergedIngredients = [];
    const checked: typeof mergedIngredients = [];
    mergedIngredients.forEach(ing => {
      if (checkedItems.has(ing.name)) {
        checked.push(ing);
      } else {
        unchecked.push(ing);
      }
    });
    return { uncheckedIngredients: unchecked, checkedIngredients: checked };
  }, [mergedIngredients, checkedItems]);

  const uncheckedCount = uncheckedIngredients.length;
  const checkedCount = checkedIngredients.length;

  if (loading) {
    return (
      <View className="shopping-page">
        <View className="loading-container">
          <AtActivityIndicator mode="center" content="正在生成购物清单..." />
        </View>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View className="shopping-page">
        <View className="empty-state">
          <Text className="empty-icon">🛒</Text>
          <Text className="empty-text">菜单是空的</Text>
          <Text className="empty-hint">先去添加一些菜品吧</Text>
          <View className="back-btn" onClick={() => Taro.navigateBack()}>
            <Text className="back-btn-text">返回</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="shopping-page">
      <View className="shopping-header">
        <View className="header-info">
          <Text className="header-title">购物清单</Text>
          <Text className="header-subtitle">
            共 {mergedIngredients.length} 种食材 · {recipes.length} 道菜
          </Text>
        </View>
        <View className="header-stats">
          <Text className="stats-text">
            待购 {uncheckedCount} · 已购 {checkedCount}
          </Text>
        </View>
      </View>

      <ScrollView className="shopping-scroll" scrollY>
        {/* 待购食材 */}
        {uncheckedIngredients.length > 0 && (
          <View className="ingredients-section">
            <View className="section-header">
              <Text className="section-label">🛒 待购</Text>
              <Text className="section-count">{uncheckedCount}</Text>
            </View>
            <View className="ingredients-list">
              {uncheckedIngredients.map(ing => (
                <View
                  key={ing.name}
                  className="ingredient-item"
                  onClick={() => toggleCheck(ing.name)}
                >
                  <View className="check-box">
                    <View className="check-inner" />
                  </View>
                  <View className="ingredient-content">
                    <Text className="ingredient-name">{ing.name}</Text>
                    <View className="ingredient-details">
                      {ing.items.map((item, idx) => (
                        <Text key={idx} className="detail-item">
                          {item.quantity}
                          <Text className="detail-recipe">
                            （{item.recipeName}）
                          </Text>
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 已购食材 */}
        {checkedIngredients.length > 0 && (
          <View className="ingredients-section checked-section">
            <View className="section-header">
              <Text className="section-label">✅ 已购</Text>
              <Text className="section-count">{checkedCount}</Text>
            </View>
            <View className="ingredients-list">
              {checkedIngredients.map(ing => (
                <View
                  key={ing.name}
                  className="ingredient-item checked"
                  onClick={() => toggleCheck(ing.name)}
                >
                  <View className="check-box checked">
                    <AtIcon value="check" size="12" color="#fff" />
                  </View>
                  <View className="ingredient-content">
                    <Text className="ingredient-name">{ing.name}</Text>
                    <View className="ingredient-details">
                      {ing.items.map((item, idx) => (
                        <Text key={idx} className="detail-item">
                          {item.quantity}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 菜品清单 */}
        <View className="recipes-section">
          <View className="section-header">
            <Text className="section-label">📋 菜品</Text>
            <Text className="section-count">{recipes.length}</Text>
          </View>
          <View className="recipes-list">
            {recipes.map(({ detail, servings }) => (
              <View key={detail.id} className="recipe-item">
                {detail.image_path ? (
                  <Image
                    src={detail.image_path}
                    className="recipe-image"
                    mode="aspectFill"
                  />
                ) : (
                  <View className="recipe-image-placeholder">🍽️</View>
                )}
                <View className="recipe-info">
                  <Text className="recipe-name">
                    {detail.name.replace(/的做法$/, '')}
                  </Text>
                  <Text className="recipe-servings">{servings}人份</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="bottom-spacer" />
      </ScrollView>
    </View>
  );
};

export default ShoppingPage;
