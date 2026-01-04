import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, Image, ScrollView, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtIcon, AtLoadMore } from 'taro-ui';
import {
  getViewHistory,
  HistoryListItem,
  clearViewHistory,
  removeViewHistory,
} from '../../services/history';
import { isLoggedIn } from '../../services/user';
import { getCategoryLabel, getCategoryColor } from '../../utils/category';
import './history.scss';

// 日期分组
interface DateGroup {
  date: string;
  fullDate: string;
  isToday: boolean;
  isYesterday: boolean;
  items: HistoryListItem[];
}

// 经常浏览的菜谱统计
interface FrequentRecipe {
  recipeId: string;
  recipe: HistoryListItem['recipe'];
  count: number;
}

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [isManaging, setIsManaging] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 20;

  // total 用于更新删除后的总数
  void total;

  // 长按进入管理模式
  const handleLongPressStart = useCallback((e: ITouchEvent) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      Taro.vibrateShort({ type: 'medium' });
      setIsManaging(true);
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const loadHistory = useCallback(
    async (isLoadMore = false) => {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = isLoadMore ? history.length : 0;
        const res = await getViewHistory({ limit: PAGE_SIZE, offset });

        if (isLoadMore) {
          setHistory(prev => [...prev, ...res.items]);
        } else {
          setHistory(res.items);
        }

        setTotal(res.total);
        setHasMore(res.items.length === PAGE_SIZE);
      } catch (error) {
        console.error('加载浏览历史失败:', error);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [history.length]
  );

  useEffect(() => {
    loadHistory();
  }, []);

  Taro.useDidShow(() => {
    if (isLoggedIn() && history.length > 0) {
      loadHistory();
    }
  });

  const navigateToDetail = useCallback(
    (recipeId: string) => {
      if (isManaging) return;
      Taro.navigateTo({ url: `/pages/recipe/detail?id=${recipeId}` });
    },
    [isManaging]
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadHistory(true);
    }
  }, [loadingMore, hasMore, loadHistory]);

  // 退出管理模式
  const exitManageMode = useCallback(() => {
    setIsManaging(false);
    setSelectedIds(new Set());
  }, []);

  // 选择/取消选择单个项目
  const toggleSelect = useCallback((recipeId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(item => item.recipe_id)));
    }
  }, [history, selectedIds.size]);

  // 删除选中的记录
  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    Taro.showModal({
      title: '确认删除',
      content: `确定删除选中的 ${selectedIds.size} 条记录吗？`,
      success: async res => {
        if (res.confirm) {
          try {
            Taro.showLoading({ title: '删除中...' });
            for (const id of selectedIds) {
              await removeViewHistory(id);
            }
            setHistory(prev =>
              prev.filter(item => !selectedIds.has(item.recipe_id))
            );
            setTotal(prev => prev - selectedIds.size);
            setSelectedIds(new Set());
            setIsManaging(false);
            Taro.hideLoading();
            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error) {
            Taro.hideLoading();
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  }, [selectedIds]);

  // 清空全部
  const handleClearHistory = useCallback(() => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有浏览历史吗？',
      success: async res => {
        if (res.confirm) {
          try {
            await clearViewHistory();
            setHistory([]);
            setTotal(0);
            setIsManaging(false);
            Taro.showToast({ title: '已清空', icon: 'success' });
          } catch (error) {
            console.error('清空浏览历史失败:', error);
            Taro.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      },
    });
  }, []);

  // 统计经常浏览的菜谱（去重后按出现次数排序，取前6个）
  const frequentRecipes = useMemo(() => {
    const countMap = new Map<string, FrequentRecipe>();
    history.forEach(item => {
      const existing = countMap.get(item.recipe_id);
      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(item.recipe_id, {
          recipeId: item.recipe_id,
          recipe: item.recipe,
          count: 1,
        });
      }
    });
    // 按浏览次数排序，取前6个（至少浏览1次就显示）
    return Array.from(countMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [history]);

  // 按日期分组
  const dateGroups = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groupMap = new Map<string, DateGroup>();
    history.forEach(item => {
      const viewedAt = new Date(item.viewed_at);
      const viewedDate = new Date(
        viewedAt.getFullYear(),
        viewedAt.getMonth(),
        viewedAt.getDate()
      );
      const month = (viewedAt.getMonth() + 1).toString().padStart(2, '0');
      const day = viewedAt.getDate().toString().padStart(2, '0');
      const dateKey = `${month}/${day}`;
      const fullDate = `${viewedAt.getFullYear()}-${month}-${day}`;
      const isToday = viewedDate.getTime() === today.getTime();
      const isYesterday = viewedDate.getTime() === yesterday.getTime();

      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, {
          date: dateKey,
          fullDate,
          isToday,
          isYesterday,
          items: [],
        });
      }
      groupMap.get(dateKey)!.items.push(item);
    });
    return Array.from(groupMap.values()).sort((a, b) =>
      b.fullDate.localeCompare(a.fullDate)
    );
  }, [history]);

  // 未登录
  if (!isLoggedIn()) {
    return (
      <View className="history-page">
        <View className="empty-state">
          <Text className="empty-icon">👣</Text>
          <Text className="empty-title">登录后查看浏览足迹</Text>
          <View
            className="action-btn"
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            去登录
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="history-page">
        <View className="loading-wrapper">
          <AtLoadMore status="loading" />
        </View>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View className="history-page">
        <View className="empty-state">
          <Text className="empty-icon">👣</Text>
          <Text className="empty-title">暂无浏览足迹</Text>
          <Text className="empty-hint">去发现更多美味菜谱吧</Text>
          <View
            className="action-btn"
            onClick={() => Taro.switchTab({ url: '/pages/recipe/index' })}
          >
            探索菜谱
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="history-page">
      {/* 管理模式提示 */}
      {isManaging && (
        <View className="manage-hint">
          <Text className="hint-text">
            长按已进入管理模式，点击选择要删除的记录
          </Text>
        </View>
      )}

      <ScrollView
        className="history-scroll"
        scrollY
        onScrollToLower={handleLoadMore}
      >
        {/* 经常浏览（非管理模式时显示） */}
        {!isManaging && frequentRecipes.length > 0 && (
          <View className="frequent-section">
            <View className="section-header">
              <Text className="section-title">经常浏览</Text>
            </View>
            <ScrollView
              className="frequent-scroll"
              scrollX
              showScrollbar={false}
            >
              <View className="frequent-list">
                {frequentRecipes.map(item => (
                  <View
                    key={item.recipeId}
                    className="frequent-item"
                    onClick={() => navigateToDetail(item.recipeId)}
                  >
                    <View className="frequent-image-wrapper">
                      {item.recipe?.image_path ? (
                        <Image
                          className="frequent-image"
                          src={item.recipe.image_path}
                          mode="aspectFill"
                          lazyLoad
                        />
                      ) : (
                        <View className="frequent-image placeholder">
                          <Text>🍳</Text>
                        </View>
                      )}
                      {/* 分类标签 - 左上角 */}
                      {item.recipe?.category && (
                        <View
                          className="frequent-category"
                          style={{
                            backgroundColor: getCategoryColor(
                              item.recipe.category
                            ),
                          }}
                        >
                          <Text className="category-text">
                            {getCategoryLabel(item.recipe.category)}
                          </Text>
                        </View>
                      )}
                      {/* 浏览次数 - 左下角 */}
                      <View className="frequent-badge">
                        <Text className="badge-text">{item.count}次</Text>
                      </View>
                    </View>
                    <Text className="frequent-name">
                      {item.recipe?.name?.replace(/的做法$/, '') || '未知'}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 按日期分组的浏览记录 */}
        <View className="history-content">
          {dateGroups.map(group => (
            <View key={group.date} className="date-section">
              <View className="date-header">
                <Text className="date-title">
                  {group.isToday
                    ? '今天'
                    : group.isYesterday
                      ? '昨天'
                      : group.date}
                </Text>
                <Text className="date-count">{group.items.length}</Text>
              </View>

              <View className="date-items">
                {group.items.map(item => {
                  const isSelected = selectedIds.has(item.recipe_id);
                  return (
                    <View
                      key={`${item.recipe_id}-${item.viewed_at}`}
                      className={`history-item ${isManaging ? 'managing' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        isManaging
                          ? toggleSelect(item.recipe_id)
                          : navigateToDetail(item.recipe_id)
                      }
                      onTouchStart={
                        !isManaging ? handleLongPressStart : undefined
                      }
                      onTouchEnd={!isManaging ? handleLongPressEnd : undefined}
                      onTouchCancel={
                        !isManaging ? handleLongPressEnd : undefined
                      }
                    >
                      <View className="item-image-wrapper">
                        {item.recipe?.image_path ? (
                          <Image
                            className="item-image"
                            src={item.recipe.image_path}
                            mode="aspectFill"
                            lazyLoad
                          />
                        ) : (
                          <View className="item-image placeholder">
                            <Text>🍳</Text>
                          </View>
                        )}
                        {/* 分类标签 - 左上角 */}
                        {item.recipe?.category && (
                          <View
                            className="item-category"
                            style={{
                              backgroundColor: getCategoryColor(
                                item.recipe.category
                              ),
                            }}
                          >
                            <Text className="category-text">
                              {getCategoryLabel(item.recipe.category)}
                            </Text>
                          </View>
                        )}
                        {/* 管理模式选中状态 */}
                        {isManaging && (
                          <View
                            className={`item-checkbox ${isSelected ? 'checked' : ''}`}
                          >
                            {isSelected && (
                              <AtIcon value="check" size="12" color="#fff" />
                            )}
                          </View>
                        )}
                      </View>
                      <Text className="item-name">
                        {item.recipe?.name?.replace(/的做法$/, '') ||
                          '未知菜谱'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {loadingMore && <AtLoadMore status="loading" />}

        {!hasMore && history.length > 0 && (
          <View className="no-more">
            <Text className="no-more-text">— 已经到底了 —</Text>
          </View>
        )}

        <View className="bottom-spacer" />
      </ScrollView>

      {/* 管理模式底部操作栏 */}
      {isManaging && (
        <View className="manage-bar">
          <View className="manage-left" onClick={toggleSelectAll}>
            <View
              className={`select-all-checkbox ${selectedIds.size === history.length ? 'checked' : ''}`}
            >
              {selectedIds.size === history.length && (
                <AtIcon value="check" size="12" color="#fff" />
              )}
            </View>
            <Text className="select-all-text">全选</Text>
          </View>
          <View className="manage-right">
            <View
              className={`delete-btn ${selectedIds.size > 0 ? 'active' : ''}`}
              onClick={handleDeleteSelected}
            >
              删除({selectedIds.size})
            </View>
            <View className="clear-all-btn" onClick={handleClearHistory}>
              清空
            </View>
            <View className="exit-btn" onClick={exitManageMode}>
              完成
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HistoryPage;
