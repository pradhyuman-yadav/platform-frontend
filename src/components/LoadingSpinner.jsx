/**
 * LoadingSpinner component
 * Displays a loading indicator while content is being fetched
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading content...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
