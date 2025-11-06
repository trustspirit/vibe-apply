interface ReviewItemTagsProps {
  type: 'application' | 'recommendation';
  hasRecommendation?: boolean;
  hasApplication?: boolean;
}

/**
 * ReviewItemTags component displays status tags for review items
 * Shows whether an item is an application, recommendation, or both
 */
export const ReviewItemTags = ({
  type,
  hasRecommendation = false,
  hasApplication = false,
}: ReviewItemTagsProps) => {
  return (
    <div className='review__list-tags'>
      {type === 'application' && (
        <span className='review__list-tag review__list-tag--application'>
          Applied
        </span>
      )}
      {type === 'recommendation' && (
        <span className='review__list-tag review__list-tag--recommendation'>
          Recommended
        </span>
      )}
      {type === 'application' && hasRecommendation && (
        <span className='review__list-tag review__list-tag--recommendation'>
          Recommended
        </span>
      )}
      {type === 'recommendation' && hasApplication && (
        <span className='review__list-tag review__list-tag--application'>
          Applied
        </span>
      )}
    </div>
  );
};
