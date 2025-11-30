import Taro from '@tarojs/taro';
import apiConfigFile from '../config/api.config';

// API配置
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// 从配置文件获取API设置
const apiConfig: ApiConfig = {
  baseURL: apiConfigFile.API_BASE_URL,
  timeout: apiConfigFile.API_TIMEOUT,
  retries: apiConfigFile.API_RETRIES,
};

// 请求封装
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${apiConfig.baseURL}${url}`;

  // 重试逻辑
  for (let attempt = 1; attempt <= apiConfig.retries; attempt++) {
    try {
      console.log(`[API] ${attempt}/${apiConfig.retries} 请求: ${fullUrl}`);

      const response = await Taro.request({
        url: fullUrl,
        method: (options.method as any) || 'GET',
        header: {
          'Content-Type': 'application/json',
          ...(options.headers as any),
        },
        data: options.body ? JSON.parse(options.body as string) : undefined,
        timeout: apiConfig.timeout,
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`[API] 成功: ${fullUrl}`);
        return response.data as T;
      } else {
        const errorMsg = `请求失败: ${response.statusCode} ${response.data?.message || ''}`;
        console.error(`[API] ${errorMsg}`);

        // 如果是最后一次重试，抛出错误
        if (attempt === apiConfig.retries) {
          throw new Error(errorMsg);
        }
      }
    } catch (error) {
      console.error(`[API] 第${attempt}次请求失败:`, error);

      // 如果是网络错误且不是最后一次重试，继续重试
      if (attempt < apiConfig.retries) {
        console.log(`[API] ${apiConfig.retries - attempt}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
        continue;
      }

      // 最后一次重试失败，抛出错误
      throw error;
    }
  }

  // 这行代码不会执行到，但为了类型安全
  throw new Error('请求失败');
}

// 导出API配置信息（用于调试）
export const getApiConfig = () => ({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  retries: apiConfig.retries,
  config: apiConfigFile.config, // 完整的配置文件
});

// 导出默认请求函数
export default request;
