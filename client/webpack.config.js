const path = require('path')

module.exports = {
    entry: {
        Home: './client/home.js',
        Room: './client/room.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../public/js'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                  'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      importLoaders: 1,
                      modules: true
                    }
                  }
                ],
                include: /\.module\.css$/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
                exclude: /\.module\.css$/
            }
        ]
    },
    watch: true
}