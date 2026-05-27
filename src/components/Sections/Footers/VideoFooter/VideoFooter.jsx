import styles from './VideoFooter.module.css';

const VideoFooter = ({ uploader, uploader_url }) => {
  return (
    <footer className={styles.videoFooter}>
      <p>
        © {new Date().getFullYear()} <a href={uploader_url} target="_blank" rel="noopener noreferrer">{uploader}</a>. All rights reserved.
      </p>
    </footer>
  );
};

export default VideoFooter;