import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { AtButton, AtCard, AtTag } from 'taro-ui';
import Taro from '@tarojs/taro';
// 组件样式通过 babel-plugin-import 自动按需导入
import './index.scss';

interface Dish {
  id: string;
  name: string;
  image: string;
  description: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: number;
  calories: number;
  aiReason?: string;
}

const Index = () => {
  const [todayRecommend, setTodayRecommend] = useState<Dish[]>([]);
  const [hotRecipes, setHotRecipes] = useState<Dish[]>([]);

  const loadHomeData = useCallback(() => {
    // TODO: 调用 API 获取数据
    // 临时模拟数据
    setTodayRecommend([
      {
        id: '1',
        name: '宫保鸡丁',
        image:
          'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=宫保鸡丁',
        description: '经典川菜，麻辣鲜香，下饭神器',
        tags: ['川菜', '辣', '下饭'],
        difficulty: 'medium',
        cookingTime: 30,
        calories: 280,
        aiReason: '根据您的口味偏好，推荐这道经典川菜',
      },
      {
        id: '2',
        name: '番茄鸡蛋',
        image:
          'https://via.placeholder.com/300x200/FF8E53/FFFFFF?text=番茄鸡蛋',
        description: '简单易做，营养丰富，老少皆宜',
        tags: ['家常', '简单', '营养'],
        difficulty: 'easy',
        cookingTime: 15,
        calories: 150,
        aiReason: '简单快手，适合忙碌的工作日',
      },
    ]);
    setHotRecipes([
      {
        id: '3',
        name: '红烧肉',
        image:
          'https://via.placeholder.com/300x200/F5576C/FFFFFF?text=红烧肉',
        description: '肥而不腻，入口即化',
        tags: ['家常', '下饭'],
        difficulty: 'medium',
        cookingTime: 60,
        calories: 450,
      },
      {
        id: '4',
        name: '麻婆豆腐',
        image:
          'https://via.placeholder.com/300x200/667EEA/FFFFFF?text=麻婆豆腐',
        description: '麻辣鲜香，嫩滑爽口',
        tags: ['川菜', '辣', '素食'],
        difficulty: 'easy',
        cookingTime: 20,
        calories: 120,
      },
      {
        id: '5',
        name: '糖醋排骨',
        image:
          'https://via.placeholder.com/300x200/4FACFE/FFFFFF?text=糖醋排骨',
        description: '酸甜可口，外酥里嫩',
        tags: ['家常', '甜'],
        difficulty: 'medium',
        cookingTime: 45,
        calories: 380,
      },
      {
        id: '6',
        name: '清炒时蔬',
        image:
          'https://via.placeholder.com/300x200/F093FB/FFFFFF?text=清炒时蔬',
        description: '清爽健康，营养均衡',
        tags: ['素食', '健康'],
        difficulty: 'easy',
        cookingTime: 10,
        calories: 80,
      },
    ]);
  }, []);

  const navigateToRecommend = useCallback(() => {
    Taro.switchTab({
      url: '/pages/recommend/index',
    });
  }, []);

  const navigateToRecipe = useCallback(() => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    });
    // TODO: 跳转到菜谱详情页
    // Taro.navigateTo({
    //   url: `/pages/recipe/detail?id=${id}`
    // })
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return (
    <ScrollView className="home-container" scrollY onScrollToLower={() => {}}>
      {/* 顶部 Banner */}
      <View className="banner-section">
        <View className="banner-content">
          <Text className="banner-title">今天吃什么？</Text>
          <Text className="banner-subtitle">让 AI 帮你决定</Text>
          <AtButton
            type="primary"
            size="small"
            onClick={navigateToRecommend}
            className="banner-button"
          >
            智能推荐
          </AtButton>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className="quick-actions">
        <View className="action-item" onClick={navigateToRecommend}>
          <View className="action-icon recommend-icon">🤖</View>
          <Text className="action-text">AI 推荐</Text>
        </View>
        <View
          className="action-item"
          onClick={() => Taro.switchTab({ url: '/pages/recipe/index' })}
        >
          <View className="action-icon recipe-icon">📖</View>
          <Text className="action-text">菜谱</Text>
        </View>
        <View
          className="action-item"
          onClick={() => Taro.switchTab({ url: '/pages/takeout/index' })}
        >
          <View className="action-icon takeout-icon">🍔</View>
          <Text className="action-text">外卖</Text>
        </View>
      </View>

      {/* 今日推荐 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">✨ 今日推荐</Text>
          <Text className="section-more" onClick={navigateToRecommend}>
            更多 &gt;
          </Text>
        </View>
        {todayRecommend.map(dish => (
          <AtCard
            key={dish.id}
            title={dish.name}
            note={dish.aiReason}
            className="dish-card"
            onClick={navigateToRecipe}
          >
            <View className="dish-content">
              <Image
                src={dish.image}
                className="dish-image"
                mode="aspectFill"
              />
              <View className="dish-info">
                <Text className="dish-description">{dish.description}</Text>
                <View className="dish-tags">
                  {dish.tags.map((tag, index) => (
                    <AtTag key={index} size="small" type="primary">
                      {tag}
                    </AtTag>
                  ))}
                </View>
                <View className="dish-meta">
                  <Text className="meta-item">⏱ {dish.cookingTime}分钟</Text>
                  <Text className="meta-item">🔥 {dish.calories}卡</Text>
                  <Text className="meta-item">
                    {dish.difficulty === 'easy'
                      ? '简单'
                      : dish.difficulty === 'medium'
                        ? '中等'
                        : '困难'}
                  </Text>
                </View>
              </View>
            </View>
          </AtCard>
        ))}
      </View>

      {/* 热门菜谱 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">🔥 热门菜谱</Text>
          <Text
            className="section-more"
            onClick={() => Taro.switchTab({ url: '/pages/recipe/index' })}
          >
            更多 &gt;
          </Text>
        </View>
        <View className="recipe-grid">
          {hotRecipes.map(recipe => (
            <View
              key={recipe.id}
              className="recipe-item"
              onClick={navigateToRecipe}
            >
              <Image
                src={recipe.image}
                className="recipe-image"
                mode="aspectFill"
              />
              <View className="recipe-info">
                <Text className="recipe-name">{recipe.name}</Text>
                <Text className="recipe-desc">{recipe.description}</Text>
                <View className="recipe-meta">
                  <Text className="recipe-time">
                    {recipe.cookingTime}分钟
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Index;
