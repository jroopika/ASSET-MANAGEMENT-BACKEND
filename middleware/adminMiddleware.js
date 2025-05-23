module.exports = (req, res, next) => {
    console.log("Admin middleware executed");
    next();
};
