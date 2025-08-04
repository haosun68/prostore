'use client';

import { Review } from "@/types";
import { useState } from "react";
import ReviewForm from "./review-form";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const reload = () => {
    console.log('Review Submitted');
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {/* REVIEWS HERE */}
      </div>
    </div>
  );
};

export default ReviewList; 