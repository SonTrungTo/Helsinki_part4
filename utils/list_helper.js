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

module.exports = {
    dummy, totalLikes, favoriteBlog
};