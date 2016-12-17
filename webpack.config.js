/**
 * Created by star on 2016/11/5.
 */
module.exports = {
    entry:{
        animation:'./src/animation.js'
    },
    output:{
        path:__dirname + '/build/',
        filename:'[name].js',
        library:'animation',
        libraryTarget:'umd'
    }
};