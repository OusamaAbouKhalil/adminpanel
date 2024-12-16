import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import fsdb from "../utils/firebaseconfig";

const ReviewsPage = () => {
  const { rest_id } = useParams(); // Get restaurant ID from URL params
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsSnapshot = await fsdb
          .collection('restaurants')
          .doc(rest_id)
          .collection('reviews')
          .get();

        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(reviewsData); // Set reviews state
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [rest_id]);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reviews for Restaurant {rest_id}</h1>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b py-4">
              <div className="font-semibold">{review.user_name}</div>
              <div className="text-sm text-gray-500">{review.date}</div>
              <div className="mt-2">{review.comment}</div>
              <div className="mt-2 text-yellow-500">
                {'★'.repeat(review.rating)}{' '}
                {'☆'.repeat(5 - review.rating)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
