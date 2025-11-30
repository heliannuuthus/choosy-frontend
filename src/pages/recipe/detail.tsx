import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AtMessage, AtLoadMore } from 'taro-ui';
import { getRecipeDetail, RecipeDetail } from '../../services/recipe';
// 组件样式通过 babel-plugin-import 自动按需导入
import './detail.scss';

const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 获取难度显示
  const getDifficultyText = useCallback((difficulty: number) => {
    const levels = ['简单', '中等', '困难'];
    return levels[difficulty - 1] || '未知';
  }, []);

  // 获取难度颜色
  const getDifficultyColor = useCallback((difficulty: number) => {
    const colors = ['#52c41a', '#faad14', '#ff4d4f'];
    return colors[difficulty - 1] || '#999999';
  }, []);

  // 加载菜谱详情
  const loadRecipeDetail = useCallback(async (recipeId: string) => {
    setLoading(true);
    try {
      const recipeData = await getRecipeDetail(recipeId);
      setRecipe(recipeData);
      setLoading(false);

      // 设置页面标题
      Taro.setNavigationBarTitle({
        title: recipeData.name,
      });
    } catch (error) {
      console.error('加载菜谱详情失败:', error);
      setLoading(false);
      Taro.atMessage({
        message: '加载菜谱详情失败',
        type: 'error',
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }
  }, []);

  useEffect(() => {
    const { id } = Taro.getCurrentInstance().router?.params || {};
    if (id) {
      loadRecipeDetail(id);
    } else {
      Taro.showToast({
        title: '菜谱ID不存在',
        icon: 'none',
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }
  }, [loadRecipeDetail]);

  if (loading) {
    return (
      <View className="recipe-detail-page">
        <AtLoadMore status="loading" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="recipe-detail-page">
        <View className="empty-state">
          <Text className="empty-text">菜谱不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="recipe-detail-page">
      <AtMessage />
      <ScrollView className="detail-scroll" scrollY>
        {/* 菜谱图片 */}
        {recipe.image_path && (
          <Image
            src={recipe.image_path}
            className="recipe-header-image"
            mode="aspectFill"
          />
        )}

        {/* 基本信息 */}
        <View className="recipe-header">
          <Text className="recipe-title">{recipe.name}</Text>
          <Text className="recipe-description">{recipe.description}</Text>

          <View className="recipe-meta-info">
            <View className="meta-item">
              <Text className="meta-label">难度</Text>
              <Text
                className="meta-value"
                style={{ color: getDifficultyColor(recipe.difficulty) }}
              >
                {getDifficultyText(recipe.difficulty)}
              </Text>
            </View>
            {recipe.total_time_minutes && (
              <View className="meta-item">
                <Text className="meta-label">时长</Text>
                <Text className="meta-value">
                  {recipe.total_time_minutes}分钟
                </Text>
              </View>
            )}
            <View className="meta-item">
              <Text className="meta-label">份量</Text>
              <Text className="meta-value">{recipe.servings}人份</Text>
            </View>
          </View>

          {/* 标签 */}
          {recipe.tags.length > 0 && (
            <View className="recipe-tags">
              {recipe.tags.map((tag, index) => (
                <Text key={index} className="tag">
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 食材清单 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">📋 食材清单</Text>
            <Text className="section-subtitle">{recipe.servings}人份</Text>
          </View>
          <View className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} className="ingredient-item">
                <Text className="ingredient-name">{ingredient.name}</Text>
                <Text className="ingredient-quantity">
                  {ingredient.text_quantity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 制作步骤 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">👨‍🍳 制作步骤</Text>
          </View>
          <View className="steps-list">
            {recipe.steps.map(step => (
              <View key={step.step} className="step-item">
                <View className="step-number">{step.step}</View>
                <Text className="step-description">{step.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 小贴士 */}
        {recipe.additional_notes.length > 0 && (
          <View className="section">
            <View className="section-header">
              <Text className="section-title">💡 小贴士</Text>
            </View>
            <View className="notes-list">
              {recipe.additional_notes.map((note, index) => (
                <View key={index} className="note-item">
                  <Text className="note-text">{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 底部间距 */}
        <View className="bottom-spacer" />
      </ScrollView>
    </View>
  );
};

export default RecipeDetailPage;
