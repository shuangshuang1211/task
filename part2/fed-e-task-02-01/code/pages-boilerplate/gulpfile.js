// 实现这个项目的构建任务
// 在开发环境，只需要转换css(如果是用sass等格式编写的，js如果是用最新的ES格式编写的需转成向后兼容的文件适应版本较低的浏览器)
// 开发环境还需要有个服务器测试页面任务，还需要一个监听的任务监听css、html、js等文件修改后，实现热加载
// 开发完成后需要压缩css js html image等相关所有文件，减少体积，再打包等操作
const { src, dest, watch, parallel, series } = require('gulp');
const loadPlugins = require('gulp-load-plugins'); // 自动加载需要的插件，不需要分步加载用到的base插件
const del = require('del');
const browsersync = require("browser-sync").create();
const minimist = require('minimist');

const {data} = require('./data');

const plugins = loadPlugins();

// clean 构建的临时文件
const clean = () => {
  return del(['temp', 'dist'])
}

// 获取命令行参数
var cliOptions = {
  string: ['port', 'env', 'open'],
  default: {
    port: process.port || '2080',
    open: 'true',
    env: process.env.NODE_ENV || 'production'
  }
};
const options = minimist(process.argv.slice(2), cliOptions);

// 启动一个服务器在本地环境
const browserSync = (done) => {
  browsersync.init({
    notify: false,
    port: options.port,
    open: options.open === 'true',
    server: {
      baseDir: ['temp', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
  done();
}

const lintCss = () => {
  return src('src/**/*.scss')
    .pipe(plugins.scssLint());
}

const lintJs = () => {
  return src('src/**/*.js')
    .pipe(plugins.eslint({
      rules: {
          'my-custom-rule': 1,
          'strict': 2
      },
      globals: [
          'jQuery',
          '$'
      ],
      envs: [
          'browser'
      ]
  }))
}

// 转换css文件
const complieStyle = () => {
  return src('src/assets/styles/*.scss', {base: 'src'})
    .pipe(plugins.sass({ outputStyle: 'expanded'}))
    .pipe(dest('./temp'))
    .pipe(browsersync.reload({ stream: true }))
}

// 转换js文件
const complieJs = () => {
  return src('src/assets/**/*.js', {base: 'src'})
    .pipe(plugins.babel({presets: ['@babel/preset-env']}))
    .pipe(dest('./temp'))
    .pipe(browsersync.reload({ stream: true }))
}

// 转换包含模板语法的html文件
const complieHtml = () => {
  return src('src/*.html', {base: 'src'})
    .pipe(plugins.swig({data, defaults: { cache: false }}))
    .pipe(dest('./temp'))
    .pipe(browsersync.reload({ stream: true }))
}

// 监听本地修改的文件
const watchAll = () => {
  watch('src/**/*.scss', complieStyle);
  watch('src/**/*.js', complieJs);
  watch('src/**/*.html', complieHtml)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], browsersync.reload)
}

// 生产环境要压缩 img font js html css
const compressImg = () => {
  return src(['src/assets/images/**', 'src/assets/fonts/**'], { base: 'src'})
    .pipe(plugins.imagemin())
    .pipe(dest('dist/src'))
}

const getPublic = () => {
  return src('public/**', { base: 'public'})
    .pipe(dest('dist/public'))
}

const compressTmp = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.']}))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.css$/, plugins.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
    })))
    .pipe(dest('dist/src'))
}

const tarFile = () => {
  return src('./dist/**')
    .pipe(plugins.tar('build.tar'))
    .pipe(plugins.gzip({append: true}))
    .pipe(dest('./dist'))
}

const delDist = () => {
  return del(["./dist/*", "!**.tar.gz"])
}

const lint = parallel(lintCss, lintJs);
const compile = parallel(complieStyle, complieJs, complieHtml);
const serve = series(compile, parallel(watchAll, browserSync));
const build = series(clean, parallel(series(compile, compressTmp), compressImg, getPublic), tarFile, delDist)

module.exports = {
  clean,
  serve,
  build,
  compile,
  lint
}