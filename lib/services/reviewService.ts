import { api } from "../api-client";

export interface ReviewPayload {
  product_id?: number;
  rating: number;
  comment: string;
  name?: string;
}

export const reviewService = {
  async submitReview(data: ReviewPayload): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/reviews", data);
    return response.data;
  }
};
