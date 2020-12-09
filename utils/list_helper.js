const _ = require('lodash');

const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogList) => {
    return blogList.length === 0 ? 0 :
        blogList.reduce((sum, { likes }) => sum + likes, 0);
};

const favoriteBlog = (blogList) => {
    return blogList.length === 0 ? {} :
        blogList.reduce((currentItem, item) =>
            Math.max(currentItem.likes, item.likes) !== currentItem.likes ?
                item : currentItem, blogList[0]);
};

const mostBlogs = (blogList) => {
    if (blogList.length === 0) return {};
    let newList = [];
    _.forEach(_.countBy(blogList, 'author'), (value, key) => {
        let blog = { author: key, blogs: value };
        newList.push(blog);
    });
    return _.orderBy(newList, 'blogs', 'desc')[0];
};

const mostLikes = (blogList) => {
    if (blogList.length === 0) return {};
    let newList = [];
    _.forEach(_.groupBy(blogList, 'author'), (value, key) => {
        const totalLikes = value.reduce((sum, { likes }) => sum + likes, 0);
        let blog = { author: key, likes: totalLikes };
        newList.push(blog);
    });
    return _.orderBy(newList, 'likes', 'desc')[0];
};

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
};