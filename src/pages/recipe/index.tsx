import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  AtSearchBar,
  AtLoadMore,
  AtMessage,
  AtActivityIndicator,
  AtIcon,
  AtBadge,
  AtFloatLayout,
} from 'taro-ui';
import {
  getRecipes,
  getCategories,
  RecipeListItem,
} from '../../services/recipe';
import './index.scss';

// 存储 key
const COOKING_LIST_KEY = 'cooking_list';

// 清单项类型
interface CookingListItem {
  id: string;
  name: string;
  image_path?: string;
  category: string;
  addedAt: number;
}

// 获取做饭清单
const getCookingList = (): CookingListItem[] => {
  try {
    const data = Taro.getStorageSync(COOKING_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 保存做饭清单
const saveCookingList = (items: CookingListItem[]) => {
  Taro.setStorageSync(COOKING_LIST_KEY, JSON.stringify(items));
};

// 每个分类的数据状态
interface CategoryData {
  recipes: RecipeListItem[];
  loading: boolean;
  hasMore: boolean;
  page: number;
}

const Recipe = () => {
  const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [cookingList, setCookingList] = useState<CookingListItem[]>([]);
  const [showCookingList, setShowCookingList] = useState(false);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const pageSize = 20;

  // 使用 ref 保存最新的 searchValue
  const searchValueRef = useRef<string>('');
  useEffect(() => {
    searchValueRef.current = searchValue;
  }, [searchValue]);

  // 使用 ref 保存 categoryData
  const categoryDataRef = useRef<Record<string, CategoryData>>({});
  useEffect(() => {
    categoryDataRef.current = categoryData;
  }, [categoryData]);

  // 初始化加载做饭清单
  useEffect(() => {
    const list = getCookingList();
    setCookingList(list);
  }, []);

  // 计算滚动区域高度
  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query.select('.header-section').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      const headerHeight = res[0]?.height || 0;
      const systemInfo = Taro.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      // 减去 1px 补偿 border
      setScrollHeight(windowHeight - headerHeight - 1);
    });
  }, []);

  // 更新分类数据
  const updateCategoryData = useCallback((category: string, updates: Partial<CategoryData>) => {
    setCategoryData(prev => {
      const currentData = prev[category] || {
        recipes: [],
        loading: false,
        hasMore: true,
        page: 0,
      };
      return {
        ...prev,
        [category]: {
          ...currentData,
          ...updates,
        },
      };
    });
  }, []);

  // 加载分类列表
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(safeCategories);
    } catch (error) {
      console.error('加载分类失败:', error);
      Taro.atMessage({
        message: '加载分类失败',
        type: 'error',
      });
      setCategories([]);
    }
  }, []);

  // 加载菜谱列表
  const loadRecipes = useCallback(async (category: string, reset = false) => {
    const currentData = categoryDataRef.current[category] || {
      recipes: [],
      loading: false,
      hasMore: true,
      page: 0,
    };

    if (currentData.loading) return;

    updateCategoryData(category, { loading: true });

    try {
      const page = reset ? 0 : currentData.page;
      const currentSearchValue = searchValueRef.current;
      const recipes = await getRecipes({
        category: category || undefined,
        search: currentSearchValue || undefined,
        limit: pageSize,
        offset: page * pageSize,
      });

      const latestData = categoryDataRef.current[category] || {
        recipes: [],
        loading: false,
        hasMore: true,
        page: 0,
      };
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          recipes: reset ? recipes : [...latestData.recipes, ...recipes],
          hasMore: recipes.length === pageSize,
          page: page + 1,
          loading: false,
        },
      }));
    } catch (error) {
      console.error('加载菜谱失败:', error);
      updateCategoryData(category, { loading: false });
      Taro.atMessage({
        message: '加载菜谱失败',
        type: 'error',
      });
    }
  }, [updateCategoryData, pageSize]);

  // 切换分类
  const handleCategoryChange = useCallback((category: string) => {
    setCurrentCategory(category);

    const currentData = categoryDataRef.current[category] || {
      recipes: [],
      loading: false,
      hasMore: true,
      page: 0,
    };

    if (currentData.recipes.length === 0 && !currentData.loading) {
      loadRecipes(category, true);
    }
  }, [loadRecipes]);

  // 搜索输入变化
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // 执行搜索
  const handleSearchAction = useCallback(() => {
    if (!searchValue || searchValue.trim() === '') {
      Taro.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
      });
      return;
    }

    searchValueRef.current = searchValue;
    setCategoryData({});
    categoryDataRef.current = {};

    setTimeout(() => {
      loadRecipes(currentCategory, true);
    }, 0);
  }, [currentCategory, searchValue, loadRecipes]);

  // 跳转到详情页
  const navigateToDetail = useCallback((recipeId: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail?id=${recipeId}`,
    });
  }, []);

  // 加载更多
  const loadMore = useCallback(() => {
    const currentData = categoryDataRef.current[currentCategory] || {
      recipes: [],
      loading: false,
      hasMore: true,
      page: 0,
    };
    if (currentData.hasMore && !currentData.loading) {
      loadRecipes(currentCategory, false);
    }
  }, [currentCategory, loadRecipes]);

  // 添加到做饭清单
  const addToCookingList = useCallback((recipe: RecipeListItem, e: any) => {
    e.stopPropagation();
    const isInList = cookingList.some(item => item.id === recipe.id);
    
      if (isInList) {
        // 已在清单中，移除
      const newList = cookingList.filter(item => item.id !== recipe.id);
      setCookingList(newList);
        saveCookingList(newList);
      } else {
        // 添加到清单
        const newItem: CookingListItem = {
          id: recipe.id,
          name: recipe.name,
          image_path: recipe.image_path,
          category: recipe.category,
          addedAt: Date.now(),
        };
      const newList = [...cookingList, newItem];
      setCookingList(newList);
        saveCookingList(newList);
    }
  }, [cookingList]);

  // 从清单移除
  const removeFromCookingList = useCallback((itemId: string, e: any) => {
    e.stopPropagation();
    setCookingList(prev => {
      const newList = prev.filter(item => item.id !== itemId);
      saveCookingList(newList);
      return newList;
    });
    Taro.showToast({
      title: '已移除',
      icon: 'none',
      duration: 1000,
    });
  }, []);

  // 清空做饭清单
  const clearCookingList = useCallback(() => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空做饭清单吗？',
      success: (res) => {
        if (res.confirm) {
          setCookingList([]);
          saveCookingList([]);
          Taro.showToast({
            title: '已清空',
            icon: 'success',
          });
        }
      },
    });
  }, []);

  // 获取难度显示
  const getDifficultyText = useCallback((difficulty: number) => {
    const levels = ['简单', '中等', '困难'];
    return levels[difficulty - 1] || '未知';
  }, []);

  // 获取难度颜色
  const getDifficultyColor = useCallback((difficulty: number) => {
    const colors = ['#52c41a', '#faad14', '#f5222d'];
    return colors[difficulty - 1] || '#999';
  }, []);

  // 初始化加载
  useEffect(() => {
    loadCategories();
    loadRecipes('', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取当前分类的数据
  const currentCategoryData = useMemo(() => {
    return categoryData[currentCategory] || {
      recipes: [],
      loading: false,
      hasMore: true,
      page: 0,
    };
  }, [categoryData, currentCategory]);

  // 检查菜谱是否在清单中
  const isInCookingList = useCallback((recipeId: string) => {
    return cookingList.some(item => item.id === recipeId);
  }, [cookingList]);

  return (
    <View className="recipe-page">
      <AtMessage />

      {/* 顶部搜索栏 */}
      <View className="header-section">
        <View className="search-wrapper">
          <AtSearchBar
            value={searchValue}
            onChange={handleSearchChange}
            onActionClick={handleSearchAction}
            placeholder="搜索菜谱..."
            showActionButton
          />
        </View>
      </View>

      {/* 主内容区域 - 左右布局 */}
      <View className="main-content">
        {/* 左侧分类栏 */}
        <ScrollView
          className="category-sidebar"
          scrollY
          enhanced
          bounces
          style={{ height: scrollHeight ? `${scrollHeight}px` : '100%' }}
        >
          <View
            className={`category-item ${currentCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            <Text className="category-text">全部</Text>
          </View>
          {categories.map((cat) => (
            <View
              key={cat}
              className={`category-item ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <Text className="category-text">{cat}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 右侧菜谱列表 */}
        <ScrollView
          className="recipe-list"
          scrollY
          enhanced
          bounces
          style={{ height: scrollHeight ? `${scrollHeight}px` : '100%' }}
          onScrollToLower={loadMore}
          enableBackToTop
        >
          {/* Loading 状态 */}
          {currentCategoryData.loading && currentCategoryData.recipes.length === 0 && (
            <View className="loading-container">
              <AtActivityIndicator mode="center" content="加载中..." />
            </View>
          )}

          {/* 空状态 */}
          {!currentCategoryData.loading && currentCategoryData.recipes.length === 0 && (
            <View className="empty-state">
              <View className="empty-icon">🍳</View>
              <Text className="empty-text">暂无菜谱</Text>
            </View>
          )}

          {/* 菜谱列表 */}
          {currentCategoryData.recipes.length > 0 && (
            <View className="recipe-grid">
              {currentCategoryData.recipes.map(recipe => {
                const inList = isInCookingList(recipe.id);
                return (
                  <View
                    key={recipe.id}
                    className="recipe-card"
                    onClick={() => navigateToDetail(recipe.id)}
                  >
                    {/* 图片区域 */}
                    <View className="card-image">
                      {recipe.image_path ? (
                        <Image
                          src={recipe.image_path}
                          className="image-content"
                          mode="aspectFill"
                          lazyLoad
                        />
                      ) : (
                        <View className="image-placeholder">
                          <Text className="placeholder-emoji">🍽️</Text>
                        </View>
                      )}
                      {/* 难度标签 */}
                      <View
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                      >
                        {getDifficultyText(recipe.difficulty)}
                      </View>
                    </View>

                    {/* 信息区域 */}
                    <View className="card-info">
                      <View className="info-content">
                        <Text className="recipe-name">{recipe.name}</Text>
                        <Text className="recipe-desc" numberOfLines={1}>
                          {recipe.description || '暂无描述'}
                        </Text>
                        <View className="recipe-meta">
                          {recipe.total_time_minutes && (
                            <View className="meta-item">
                              <AtIcon value="clock" size="12" color="#999" />
                              <Text className="meta-text">{recipe.total_time_minutes}分钟</Text>
                            </View>
                          )}
                          <View className="meta-item">
                            <AtIcon value="tag" size="12" color="#999" />
                            <Text className="meta-text">{recipe.category}</Text>
                          </View>
                        </View>
                        {/* 标签 */}
                        {recipe.tags && recipe.tags.length > 0 && (
                          <View className="recipe-tags">
                            {recipe.tags.slice(0, 2).map((tag, idx) => (
                              <Text key={idx} className="tag">{tag}</Text>
                            ))}
                            {recipe.tags.length > 2 && (
                              <Text className="tag more">+{recipe.tags.length - 2}</Text>
                            )}
                          </View>
                        )}
                      </View>
                      {/* 添加到清单按钮 - 右下角 */}
                      <View
                        className={`add-to-list-btn ${inList ? 'in-list' : ''}`}
                        onClick={(e) => addToCookingList(recipe, e)}
                      >
                        <AtIcon
                          value={inList ? 'check' : 'add'}
                          size="20"
                          color="#fff"
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 加载更多 */}
          {currentCategoryData.loading && currentCategoryData.recipes.length > 0 && (
            <AtLoadMore status="loading" />
          )}
          {!currentCategoryData.hasMore && currentCategoryData.recipes.length > 0 && (
            <AtLoadMore status="noMore" noMoreText="没有更多了" />
          )}
        </ScrollView>
      </View>

      {/* 悬浮购物车按钮 */}
      <View className="floating-cart-btn" onClick={() => setShowCookingList(true)}>
        <AtBadge value={cookingList.length > 0 ? cookingList.length : ''}>
          <View className="cart-icon-wrapper">
            <AtIcon value="shopping-cart" size="28" color="#fff" />
          </View>
        </AtBadge>
        {cookingList.length > 0 && (
          <Text className="cart-label">做饭清单</Text>
        )}
      </View>

      {/* 做饭清单浮层 */}
      <AtFloatLayout
        isOpened={showCookingList}
        title="做饭清单"
        onClose={() => setShowCookingList(false)}
      >
        <View className="cooking-list">
          {cookingList.length === 0 ? (
            <View className="cooking-empty">
              <View className="cooking-empty-icon">🛒</View>
              <Text className="cooking-empty-text">清单是空的</Text>
              <Text className="cooking-empty-hint">点击菜品卡片右下角的 + 添加到清单</Text>
            </View>
          ) : (
            <>
              <View className="cooking-header">
                <Text className="cooking-count">共 {cookingList.length} 道菜</Text>
                <Text className="clear-btn" onClick={clearCookingList}>清空</Text>
              </View>
              <ScrollView className="cooking-scroll" scrollY>
                {cookingList.map(item => (
                  <View
                    key={item.id}
                    className="cooking-item"
                    onClick={() => {
                      setShowCookingList(false);
                      navigateToDetail(item.id);
                    }}
                  >
                    <View className="cooking-item-image">
                      {item.image_path ? (
                        <Image
                          src={item.image_path}
                          className="cooking-image"
                          mode="aspectFill"
                        />
                      ) : (
                        <View className="cooking-image-placeholder">🍽️</View>
                      )}
                    </View>
                    <View className="cooking-item-info">
                      <Text className="cooking-item-name">{item.name}</Text>
                      <Text className="cooking-item-category">{item.category}</Text>
                    </View>
                    <View
                      className="cooking-item-remove"
                      onClick={(e) => removeFromCookingList(item.id, e)}
                    >
                      <AtIcon value="close" size="16" color="#999" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </AtFloatLayout>
    </View>
  );
};

export default Recipe;
