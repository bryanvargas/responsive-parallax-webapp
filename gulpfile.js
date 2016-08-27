var 
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	minifycss = require('gulp-minify-css'),
	size = require('gulp-size'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	stylish = require('jshint-stylish'),
	wiredep = require('wiredep').stream,
	notify = require('gulp-notify'),
	livereload = require('gulp-livereload'),
	jscs = require('gulp-jscs'),
	inject = require('gulp-inject'),
	nodemon = require('gulp-nodemon');


var
	jsFiles = ['*.js', 'public/**/*.js'],
	source = 'app/temp_files/',
	dest = 'app/public/',

	img = {
		in: [source + 'images/*/*.*' , source + 'images/*.*'],
		out: dest + 'images/'
	},

	js = {
		in: source + 'js/*',
		jsFiles: ['js/*', './gulpfile.js'],
		out: dest + 'js/',
		filename: 'main.min.js'
	},
	css = {
		in: source + 'css/*',
		out: dest + 'css/',
		filename: 'main.min.css'
	};


function errorLog(error) {
	console.error.bind(error);
	this.emit('end');
}

gulp.task('inject', ['minify-css', 'minify-js'], function(){	
var injectSrc = gulp.src([js.out + '*', css.out + '*'], {read: false});

var injectOptions = {
	ignorePath: '/app/public'
};

var options = {		
	bowerJson: require('./bower.json'),
	directory: './app/public/bower_components',
	ignorePath : '../public'
};

//	return gulp.src('./src/views/*.html')
return gulp.src('./app/views/*.handlebars') 
	.pipe(wiredep(options))
	.pipe(inject(injectSrc, injectOptions))
	.pipe(gulp.dest('./app/views'));
});

gulp.task('jshint', function() {
		return gulp.src(js.jsFiles) //buscamos los archivos con las extensiones especificadas
		.pipe(jshint()) //funcion para ejecutar varias tareas
		.pipe(jshint.reporter(stylish, {
			verbose: true
	    }))	
	     .pipe(jshint())
    // Use gulp-notify as jshint reporter 
    .pipe(notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success 
        return false;
      }
 
    var errors = file.jshint.results.map(function (data) {
    if (data.error) {
      return '(' + data.error.line + ':' + data.error.character + ')' + data.error.reason;
    }
      }).join('\n');
      return file.relative + '(' + file.jshint.results.length + ' errors)\n' + errors;
    }))
		.pipe(jscs())
		.pipe(livereload());
});


gulp.task('minify-js', function(cb) {
	cb();
	gulp.src(js.in)
	.pipe(concat(js.filename))
	.pipe(size({title: 'JS in '}))
	.pipe(uglify())
	.pipe(size({title: 'JS out '}))
	.pipe(gulp.dest(js.out))
	.pipe(livereload())
	.pipe(notify('Done!!!'));
});

gulp.task('minify-css', function(cb) {
	cb();
	gulp.src(css.in)
	.pipe(concat(css.filename))
	.pipe(size({ title: 'CSS in '}))
	.pipe(minifycss())
	//.pipe(prefix('last 15 versions'))
	.pipe(size({ title: 'CSS out '}))
	.on('error', errorLog)
	.pipe(gulp.dest(css.out))
	.pipe(livereload())
	.pipe(notify('Done!!!'));
});

gulp.task('html', function() {
	gulp.src('./app/views/*.handlebars')
	.pipe(livereload());
});




gulp.task('watch', function() {
	//livereload.listen();
	var server = livereload();
	gulp.watch(js.in, ['minify-js']);
	gulp.watch(css.in, ['minify-css']);
	gulp.watch(js.jsFiles, ['jshint']);	
	gulp.watch(['./app/views/*.handlebars'], ['html']);	
	gulp.watch(['./app/temp_files/js/*.js'], ['inject']);
	gulp.watch(['./app/temp_files/css/*.css'], ['inject']);
	gulp.watch(['./bower.json'], ['inject']);	
});

gulp.task('default', ['minify-js', 'minify-css', 'jshint', 'html',  'inject', 'watch'], function() {
	// listen for changes
	livereload.listen();
	// configure nodemon
	nodemon({
		// the script to run the app
		script: 'server.js',
		ext: 'js'
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		gulp.src('server.js')
			.pipe(livereload())
			.pipe(notify('Reloading page, please wait..'));
	});
});