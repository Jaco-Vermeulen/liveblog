'use strict';

function getLiveHeadlineFromPosts(posts) {
  if (!posts || !posts.length) {
    return null;
  }

  var candidates = posts.filter(function(post) {
    if (post.post_status !== 'open' || post.deleted) {
      return false;
    }
    if (!post.show_headline) {
      return false;
    }
    if (!post.headline || !String(post.headline).trim()) {
      return false;
    }
    if (post.published_date && new Date(post.published_date) > new Date()) {
      return false;
    }
    return true;
  });

  if (!candidates.length) {
    return null;
  }

  candidates.sort(function(a, b) {
    var aDate = a.published_date ? new Date(a.published_date).getTime() : 0;
    var bDate = b.published_date ? new Date(b.published_date).getTime() : 0;
    return bDate - aDate;
  });

  return String(candidates[0].headline).trim();
}

function updateLiveTitle(posts) {
  if (!window.LB || !window.LB.settings || !window.LB.settings.showTitle) {
    return;
  }

  var h1 = document.querySelector('.lb-timeline h1');
  if (!h1) {
    return;
  }

  var blog = window.LB.blog || {};
  var fallback = blog.settings_title || blog.title || '';
  var live = getLiveHeadlineFromPosts(posts);
  var nextTitle = live || fallback;

  if (nextTitle && h1.textContent !== nextTitle) {
    h1.textContent = nextTitle;
  }
}

module.exports = {
  getLiveHeadlineFromPosts: getLiveHeadlineFromPosts,
  updateLiveTitle: updateLiveTitle,
};
