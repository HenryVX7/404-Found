export default function ContentCard({ post }) {
  return (
    <div className="post-container">
      <div className="profile-pic" />
      <div className="post-content">
        <div className="post-date">
          <span className="calendar-icon">📅</span> {post.date}
        </div>

        <div className="post-text">
          {post.text}
          <div className="hashtags">{post.hashtags}</div>
        </div>

        {post.image && (
          <img src={post.image} alt="Post visual" className="post-image" />
        )}
      </div>
    </div>
  );
}
