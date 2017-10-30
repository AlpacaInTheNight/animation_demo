/**
 * Main js file
 *
 * @author elerium.org
 */

"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
	
		
	/**
	 * Main app object
	 *
	 * @api system.js
	 */
	var app = new Object;
	
	/**
	 * @property {String}  name - name of the application. Defined in Config.appName.
	 */
	app.name = "application";

	/**
	 * @property {Boolean|htmlDom}  contentArea - false or a link to the active html content area for the application.
	 */
	app.contentArea = false;

	/**
	 * @property {Object} cache - object for dom cache.
	 */
	app.cache = new Object;

	/**
	 * inner application config
	 *
	 * @api system.js
	 */
	app.config = new Object;
	
	/**
	 * Collection of utils
	 *
	 * @api system.js
	 */
	app.utils = new Object;
	
	/**
	 * Utility to randomly shuffle items in an array
	 *
	 * @param {Array} array to be shuffled
	 * @return {Array} shuffled array
	 * @api system.js
	 */
	app.utils.shuffleArray = function(arr) {
		if(!arr) {
			return;
		}
			
		var currentIndex = arr.length, temporaryValue, randomIndex;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			
			temporaryValue = arr[currentIndex];
			arr[currentIndex] = arr[randomIndex];
			arr[randomIndex] = temporaryValue;
		}

		return arr;
	}
	
	/**
	 * load external javascript
	 *
	 * @param {String} src source of the script
	 * @param {Function} callback function to be called after loading the script
	 * @api system.js
	 */
	app.utils.jsLoad = function(src, callback) {
		var ID = "externalScript";
		var externalScript = document.getElementById(ID);
		if(externalScript) {
			externalScript.parentNode.removeChild(externalScript);
		}
		
		var script = document.createElement('script'), loaded;
		script.id = ID;
		script.setAttribute('src', src);
		
		if (callback) {
			script.onreadystatechange = script.onload = function() {
				if (!loaded) {
					callback();
				}
				loaded = true;
			};
		}
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	/**
	 * Parse css transform matrix and returns linear array of it's values
	 *
	 * @param {String} css transform matrix raw value
	 * @return {Array} array of transform matrix values
	 * @api system.js
	 */
	app.utils.parseCssMatrix = function(matrix) {
		if(matrix) {
			var i;
			matrix = matrix.replace("matrix(", "");
			matrix = matrix.replace(")", "");
			matrix = matrix.split(", ");
			
			for(i = 0; i < matrix.length; i++) {
				matrix[i] = parseFloat( matrix[i] );
			}
			
			return matrix;
		} else {
			return [1, 0, 0, 1, 0, 0];
		}
	}
	
	/**
	 * Return string with the css matrix format from an array
	 *
	 * @param {Array} arr array of transform matrix values
	 * @return {String} css transform matrix raw value
	 * @api system.js
	 */
	app.utils.generateCssMatrix = function(arr) {
		return "matrix(" + arr.join() + ")";
	}
	
	/**
	 * Creates and returns DOM node
	 *
	 * @param {Array} nodes - array of objects with setup for new dom elements
	 * @param {htmlDom} target - html dom element where new elements will be added
	 * @param {String} feedback - new items that have this html class name will be added to the value of function return value
	 * @param {Boolean} keepLinks - if set to true, than feedback elements will be added to previously created array.
	 * @return {Array} array of new elements that have css class that matches feedback-defined class name
	 * @api system.js
	 */
	app.createNodes = function(nodes, target, feedback, keepLinks) {
		var cache = app.cache;
		if(!Array.isArray(nodes)) {
			nodes = [nodes];
		}

		if(!keepLinks || !app.createNodes.returnLinks) {
			app.createNodes.returnLinks = new Array;
		}

		for(var i in nodes) {
			if(nodes[i].type) {
				target.appendChild(
					function(){
						var element = document.createElement( nodes[i].type );
						
						if(nodes[i].content || nodes[i].content == 0) {
							if(nodes[i].html) {
								element.innerHTML = nodes[i].content;
							} else {
								element.appendChild( document.createTextNode(nodes[i].content) );
							}
						}
						
						if(nodes[i].data){
							element.dataset.id = nodes[i].data;
						}
						
						if(nodes[i].val){
							element.setAttribute("value", nodes[i].val);
						}							
						
						if(nodes[i].id) {
							element.id = nodes[i].id;
							cache[nodes[i].id] = element;
						}							
						
						if(nodes[i].children) {
							app.createNodes(nodes[i].children, element, feedback, true);
						}
						
						if(nodes[i].selected) {
							element.selected = true;
						}
						
						if(nodes[i].className) {
							element.className = nodes[i].className;
							
							if(nodes[i].className.indexOf(feedback) != -1) {
								app.createNodes.returnLinks.push(element);
							}
						}							
						return element;
					}.bind(this)()
				);
			}
		}

		return app.createNodes.returnLinks;
	}

	/**
	 * Removes child nodes from the specified dom node
	 *
	 * @param {htmlDOM} target - html dom element from where elements will be removed
	 * @api system.js
	 */
	app.removeAllChildren = function(target) {
		while (target.firstChild) {
			target.removeChild(target.firstChild);
		}
	}
		
	/**
	 * Clears the main content area
	 *
	 * @api system.js
	 */
	app.clearContentArea = function() {
		app.removeAllChildren(app.contentArea);
	}
	
	/**
	 * @property {Array}  events - array of inner event listeners
	 */
	app.events = new Array;
	
	/**
	 * Adds new inner event listeners
	 *
	 * @todo add inner event specification
	 * @param {Object} evnt - inner event object
	 * @api system.js
	 */
	app.addEvent = function(evnt) {
		var i;
		
		for(i in app.events) {
			if(app.events[i].name == evnt.name) {
				return; //skiping if event listener ID already registered
			}
		}
		
		app.events.push(evnt);
	}
	
	/**
	 * Calls inner event
	 * For exmaple app.callEvent.call(input, "keydown") will call all functions who is listening to keydown event
	 *
	 * @param {String} eventName - name of the event
	 * @api system.js
	 */
	app.callEvent = function(eventName) {
		var i;
		
		for(i in app.events) {
			if(app.events[i].target == eventName) {
				app.events[i].call(this);
			}
		}
	}
	
	app.log = function(text) {
		if(true) {
			console.log(text);
		}
	}
	
	/**
	 * Inits application
	 *
	 * @param {String} target - dom id of the content area where application will be placed
	 * @api init.js
	 */
	app.init = function(target) {
		var audio = new Audio('Kai_Engel-June.mp3');
		
		audio.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		audio.play();
		
		//var height	= 1375;
		var height	= 1000;
		var width	= 1000;
		
		app.init.cache(target);
		
		var diff = height / app.body.clientHeight;
			
		if(width / app.body.clientWidth > diff ) {
			diff = width / app.body.clientWidth;
		}
		diff *= 1.01; //for some padding (to guarantee that there will be no scrollbars)
		
		height = parseInt(height / diff);
		width = parseInt(width / diff);
		
		app.canvas.scale = diff;
		
		app.canvas.init(app.contentArea, width, height);
		
		var assets = [
			"assets/back.jpg",
			"assets/cloud1.png",
			"assets/cloud2.png",
			"assets/cloud3.png",
			"assets/cloud4.png",
			"assets/cloud5.png",
			"assets/cloud6.png",
			
			"assets/land.png",
			"assets/layer1.png",
			"assets/layer2.png",
			"assets/layer3.png",
			
			"assets/leaf.png",
			"assets/leaf2.png",
			"assets/leaf3.png"
		];
		
		app.canvas.load( assets, setup );
		
		function setup() {
			app.cache.loadingWindow.remove();
			
			app.canvas.back = new PIXI.Container;
			app.canvas.back.setup = new Object;
			app.canvas.back.setup.width = app.canvas.width;
			app.canvas.back.setup.height = app.canvas.height;
			
			app.canvas.stage.addChild(app.canvas.back);
			
			var backImage = {
				name: "assets/back.jpg",
				id: "back1",
				width: 1000,
				height: 1375,
				contain: "width"
			};

			app.canvas.showImage( backImage, app.canvas.back );
			app.canvas.showClouds();
			app.canvas.showLand();
			app.canvas.showLeaves();
			
			app.canvas.showDemo();
			
			app.canvas.render();
			app.canvas.animate();
		}
		
		//start application body
	}
	
	
	/**
	 * Inits application cache
	 * it will create app.cache where it will add initial dom structures.
	 * 
	 * app.cache.html			- html page
	 * app.cache.mainWrapper	- main wrapper
	 * app.cache.header			- header element
	 * app.cache.content		- content element
	 * app.body					- body element
	 * app.contentArea			- content area element (wrapped inside content element for various responsive purposes)
	 *
	 * @param {String} target - dom id of the content area where application will be placed
	 * @api init.js
	 */
	app.init.cache = function(target) {
		function find(selector) {
			return document.querySelector(selector);
		}
		
		function findAll(selector) {
			return document.querySelectorAll(selector);
		}
		
		function getId(id) {
			return document.getElementById(id);
		}
		
		function getClass(selectClass) {
			return document.getElementsByClassName(selectClass);
		}
		
		function getTag(tag) {
			return document.getElementsByTagName(tag);
		}

		app.cache.html				= getTag("html")[0];
		app.cache.mainWrapper		= getId("wrapper");
		app.cache.header			= getTag("header")[0];
		app.cache.content			= getId("content");
		app.body					= getTag("body")[0];
		app.contentArea				= getId(target);
		
		app.log("inited cache");
	}
	
	
	app.canvas = new Object;
	
	//creates canvas object
	app.canvas.init = function(target, width, height) {
		if(!window.PIXI) {
			throw new Error("No Pixi.js detected");
		}
		
		var Container = PIXI.Container;

		//var renderer = PIXI.autoDetectRenderer(width, height);
		var renderer = new PIXI.CanvasRenderer(width, height);
		//renderer.autoResize = true;
		
		//renderer.view.style.border = "1px dashed white";
		renderer.backgroundColor = 0xff1639;

		//Add the canvas to the HTML document
		target.appendChild(renderer.view);
		
		var stage = new Container;
		renderer.render(stage);
		
		app.canvas.view = renderer.view;
		app.canvas.width = width;
		app.canvas.height = height;
		app.canvas.renderer = renderer;
		app.canvas.stage = stage;
		
		console.log("inited canvas");
	};
	
	//loads textures and calls provided function afterwards
	app.canvas.load = function(target, setup) {
		
		var loadingWindow = document.createElement("div");
		loadingWindow.className = "loading";
		document.body.appendChild(loadingWindow);
		app.cache.loadingWindow = loadingWindow;
		
		
		PIXI.loader
			.add(target)
			.load(setup)
			.on("progress", function(loader, resource){
				loadingWindow.textContent = "Loading: " + parseInt(loader.progress) + "%";
			});
	}
	
	app.canvas.cache = new Object;
	
	app.canvas.toScale = function(val) {
		if(app.canvas.scale != 1 && val) {
			val = parseInt(val / app.canvas.scale);
		}
		
		return val;
	}
	
	//add new image on stage
	app.canvas.showImage = function(target, container) {
		var loader		= PIXI.loader;
		var Sprite		= PIXI.Sprite;
		var scale		= app.canvas.toScale;
		var width, height;
		
		var name	= target.name;
		var x		= target.x ? target.x : 0;
		var y		= target.y ? target.y : 0;
		
		if(!target.width && !target.height) {
			if(!container) {
				width	= target.width ? target.width : app.canvas.width;
				height	= target.height ? target.height : app.canvas.height;
			} else {
				width	= target.width ? target.width : container.setup.width;
				height	= target.height ? target.height : container.setup.height;
			}
		} else {
			width = target.width;
			height = target.height;

			if(target.contain == "width") {
				width = app.canvas.width;
				var diff = target.width / app.canvas.width;
				height = parseInt(height / diff);
			} else {
				width	= scale(width);
				height	= scale(height);
			}
		}
		
		
		//should add some inner massive of all added to canvas items
		var newSprite = new Sprite(
			loader.resources[name].texture
		);
		
		newSprite.x			= x;
		newSprite.y			= y;
		newSprite.width		= width;
		newSprite.height	= height;
		
		if(target.id) {
			app.canvas.cache[target.id] = newSprite;
		}
		
		if(!container) {
			app.canvas.stage.addChild(newSprite);
		} else {
			container.addChild(newSprite);
		}
	}
	
	app.canvas.showClouds = function() {
		var loader		= PIXI.loader;
		var Sprite		= PIXI.Sprite;
		var scale		= app.canvas.toScale;
		
		var i;

		var clouds = [
			{src: "assets/cloud1.png", speed: 0.09, x: 0, y: scale(970), width: scale(1000), height: scale(277)},
			
			{src: "assets/cloud2.png", speed: 0.06, x: 0, y: scale(820), width: scale(1000), height: scale(323)},
			
			{src: "assets/cloud3.png", speed: 0.05, x: 0, y: scale(750), width: scale(922), height: scale(232)},
			
			{src: "assets/cloud4.png", speed: 0.04, x: 0, y: scale(320), width: scale(1000), height: scale(523)},
			
			{src: "assets/cloud5.png", speed: 0.03, x: scale(10), y: scale(225), width: scale(921), height: scale(467)},
			
			{src: "assets/cloud6.png", speed: 0.02, x: 0, y: 0, width: scale(1000), height: scale(420)}
		];
		
		var backClouds = [
			{src: "assets/cloud1.png", speed: 0.01, x: 0, y: scale(950), width: scale(2000), height: scale(377), alpha: 0.8},

			{src: "assets/cloud2.png", speed: 0.01, x: 0, y: scale(680), width: scale(2000), height: scale(480), alpha: 0.8},

			{src: "assets/cloud3.png", speed: 0.01, x: 0, y: scale(850), width: scale(1500), height: scale(332), alpha: 0.8},

			{src: "assets/cloud4.png", speed: 0.01, x: 0, y: scale(310), width: scale(1400), height: scale(550), alpha: 0.8},

			{src: "assets/cloud5.png", speed: 0.01, x: 0, y: scale(50), width: scale(1400), height: scale(600), alpha: 0.8},

			{src: "assets/cloud6.png", speed: 0.01, x: 0, y: 0, width: scale(1500), height: scale(520), alpha: 0.8}
		];
		
		var cloudsLenght = 0;
		

		function addBackClouds(group, first) {

			function addCloud(clouds, target, iterate, reverse) {
				
				for(i = 0; i < clouds.length; i++) {
					var newSprite = new Sprite(
						loader.resources[ clouds[i].src ].texture
					);
					newSprite.x			= clouds[i].x;
					newSprite.y			= clouds[i].y;
					newSprite.width		= clouds[i].width;
					newSprite.height	= clouds[i].height;
					newSprite.speed		= clouds[i].speed;
					
					if(reverse) {
						newSprite.scale.x	= -1;
						newSprite.anchor.x	= 1;
					}
					
					if(clouds[i].alpha) {
						newSprite.alpha	= clouds[i].alpha;
					}
					
					target.addChild(newSprite);
				}
				
			}
			
			if(first) {
				group.x			= 0;
			} else {
				group.x			= app.canvas.width * 1.3;
			}
			
			group.y			= 0;
			group.speed		= 0.01;
			group.isBack	= true;

			addCloud(backClouds, group, false, true);
			
			group.width = app.canvas.width * 1.5;
			
			app.canvas.stage.addChild(group);
			
			app.canvas.cache[ "cloud" + cloudsLenght ] = group;
			cloudsLenght++;
		}
		
		function addFrontClouds(clouds, target) {
			
			function addCloud(cloud, second) {
				var newSprite = new Sprite(
					loader.resources[ cloud.src ].texture
				);
				if(second) {
					newSprite.x			= cloud.x + cloud.width;
				} else {
					newSprite.x			= cloud.x;
				}
				
				newSprite.y			= cloud.y;
				newSprite.width		= cloud.width;
				newSprite.height	= cloud.height;
				newSprite.speed		= cloud.speed;
				if(cloud.alpha) {
					newSprite.alpha	= cloud.alpha;
				}
				
				app.canvas.cache[ "cloud" + cloudsLenght ] = newSprite;
				target.addChild(newSprite);
				cloudsLenght++;
			}
			
			for(i = 0; i < clouds.length; i++) {
				
				addCloud(clouds[i], false);
				addCloud(clouds[i], true);
			}
		}
		
		addBackClouds(new PIXI.Container(), true);
		addBackClouds(new PIXI.Container(), false);

		addFrontClouds(clouds, app.canvas.stage);
		
		app.canvas.cloudsLenght = cloudsLenght;
	}
	
	app.canvas.showDemo = function() {
		var demoInfo = document.createElement("div");
		demoInfo.className = "loading demoinfo";
		
		demoInfo.innerHTML = "<p>Simple Pixi.js Demo</p>";
		demoInfo.innerHTML += "Art belongs to <a title='art by' href='http://www.pixiv.net/member_illust.php?id=211515'>Sakimori</a><br>";
		demoInfo.innerHTML += "Music: <a title='music by' href='http://www.kai-engel.com/'>\"June\" by Kai Engel</a>";

		document.body.appendChild(demoInfo);
		
		app.canvas.demoInfo = demoInfo;
	}
	
	app.canvas.showLand =  function() {
		var scale		= app.canvas.toScale;
		var animator	= app.canvas.animate.land;
		
		app.canvas.landscape = new PIXI.Container;
		app.canvas.landscape.setup = new Object;
		app.canvas.landscape.setup.width = app.canvas.width;
		app.canvas.landscape.setup.height = app.canvas.height;
		
		app.canvas.stage.addChild(app.canvas.landscape);
		
		var landImage = {
			name: "assets/land.png",
			id: "land",
			width: 1000,
			height: 185,
			contain: "width"
		};
		
		var landImage2 = {
			name: "assets/land.png",
			id: "land2",
			width: 1000,
			height: 185,
			contain: "width"
		};
		
		var layer1 = {
			name: "assets/layer1.png",
			id: "layer1",
			width: 776,
			height: 219
		};
		
		var layer2 = {
			name: "assets/layer2.png",
			id: "layer2",
			width: 1000,
			height: 459
		};
		var layer3 = {
			name: "assets/layer3.png",
			id: "layer3",
			width: 1000,
			height: 672
		};
		
		app.canvas.showImage( landImage, app.canvas.landscape );
		app.canvas.showImage( landImage2, app.canvas.landscape );
		app.canvas.showImage( layer1, app.canvas.landscape );
		app.canvas.showImage( layer2, app.canvas.landscape );
		app.canvas.showImage( layer3, app.canvas.landscape );
		
		app.canvas.cache["land"].y = scale(817);
		app.canvas.cache["land2"].y = scale(817);
		app.canvas.cache["layer1"].y = scale(695);
		app.canvas.cache["layer2"].y = scale(465);
		app.canvas.cache["layer3"].y = scale(260);
		
		animator.container = app.canvas.landscape;
		animator.layers = [];
		
		animator.layers.push(app.canvas.cache["land"]);
		animator.layers.push(app.canvas.cache["layer1"]);
		animator.layers.push(app.canvas.cache["layer2"]);
		animator.layers.push(app.canvas.cache["layer3"]);
		animator.layers.push(app.canvas.cache["land2"]);

		
		var step = 750;
		animator.stop = false;

		for(var i = 0; i < animator.layers.length; i++) {
			animator.layers[i].baseY = animator.layers[i].y;
			animator.layers[i].y += scale(step);
			animator.layers[i].step = step / 420;

			step += 100;
		}
	}
	
	app.canvas.showLeaves = function() {
		var loader		= PIXI.loader;
		var Sprite		= PIXI.Sprite;
		var scale		= app.canvas.toScale;
		var animator	= app.canvas.animate.leaves;
		var newSprite;
		
		var container = new PIXI.Container();
		
		var leaves = [
			{src: "assets/leaf3.png", radius: 10, speed: 100, rotate: 0.02, x: scale(800), y: scale(200), scaleY: 0.3},
			{src: "assets/leaf3.png", radius: 8, speed: 200, rotate: 0.02, x: scale(820), y: scale(200), scaleY: -0.8},
			{src: "assets/leaf3.png", radius: 11, speed: 300, rotate: 0.02, x: scale(750), y: scale(200), scaleY: 1},
			
			{src: "assets/leaf3.png", radius: 110, speed: 1100, rotate: 0.03, x: scale(1200), y: scale(0), scaleY: 0.3},
			{src: "assets/leaf3.png", radius: 18, speed: 1300, rotate: 0.03, x: scale(1100), y: scale(10), scaleY: -0.8},
			{src: "assets/leaf3.png", radius: 111, speed: 1100, rotate: 0.03, x: scale(700), y: scale(-10), scaleY: 1},
			
			{src: "assets/leaf3.png", radius: 12, speed: 250, rotate: 0.02, x: scale(200), y: scale(-200), scaleY: -0.8},
			{src: "assets/leaf3.png", radius: 130, speed: 350, rotate: 0.03, x: scale(520), y: scale(550), scaleY: 0.4},
			
			
			{src: "assets/leaf.png", radius: 150, speed: 1010, rotate: 0.03, x: scale(120), y: scale(120), scaleY: 1},
			{src: "assets/leaf.png", radius: 100, speed: 990, rotate: 0.03, x: scale(800), y: scale(500), scaleY: 0.4},
			{src: "assets/leaf.png", radius: 80, speed: 800, rotate: 0.03, x: scale(500), y: scale(-120), scaleY: -0.9},
			{src: "assets/leaf.png", radius: 120, speed: 1200, rotate: 0.03, x: scale(100), y: scale(520), scaleY: -0.7},
			
			{src: "assets/leaf2.png", radius: 110, speed: 1000, rotate: 0.03, x: scale(1000), y: scale(400), scaleY: 0.2},
			{src: "assets/leaf2.png", radius: 12, speed: 110, rotate: 0.02, x: scale(203), y: scale(300), scaleY: -0.5},
			{src: "assets/leaf2.png", radius: 10, speed: 105, rotate: 0.02, x: scale(1210), y: scale(200), scaleY: 0.3},
			{src: "assets/leaf2.png", radius: 8, speed: 100, rotate: 0.02, x: scale(510), y: scale(510), scaleY: 1},
			
			{src: "assets/leaf2.png", radius: 50, speed: 200, rotate: 0.02, x: scale(105), y: scale(0), scaleY: 0.6},
			{src: "assets/leaf2.png", radius: 40, speed: 150, rotate: 0.02, x: scale(508), y: scale(505), scaleY: 0.2},
			{src: "assets/leaf2.png", radius: 18, speed: 100, rotate: 0.02, x: scale(810), y: scale(608), scaleY: -0.3}
			
		];
		
		animator.leaves = new Array;
		
		for(var i = 0; i < leaves.length; i++) {
			var newSprite = new Sprite(
				loader.resources[ leaves[i].src ].texture
			);
			newSprite.x			= leaves[i].x;
			newSprite.baseX		= leaves[i].x;
			newSprite.y			= leaves[i].y;
			newSprite.baseY		= leaves[i].y;
			newSprite.shiftX	= 0;
			newSprite.shiftY	= 0;
			
			//wip
			newSprite.width		= scale(newSprite.width);
			newSprite.height	= scale(newSprite.height);
			
			newSprite.radius	= leaves[i].radius;
			newSprite.rotate	= leaves[i].rotate;
			
			newSprite.baseScaleX = newSprite.scale.x;
			newSprite.baseScaleY = newSprite.scale.y;
			
			newSprite.scale.y	= leaves[i].scaleY;
			
			newSprite.angle		= 0;
			newSprite.i			= 0;
			newSprite.speed		= leaves[i].speed;
			newSprite.step		= Math.PI / (leaves[i].speed / 2);
			
			animator.leaves.push(newSprite);
			container.addChild(newSprite);
		}
		
		
		animator.leavesPlane = container;
		app.canvas.stage.addChild(container);
	}
	
	//single canvas redraw
	app.canvas.render = function() {
		app.canvas.renderer.render( app.canvas.stage );
	}
	
	app.canvas.animate = function() {
		var animations = app.canvas.animate;
		
		if(!Math.doublePI) {
			Math.doublePI = Math.PI * 2;
		}

		animations.moveClouds();
		animations.panDown();
		animations.land();
		animations.leaves();
		
		app.canvas.render();
		
		//next animation cycle
		requestAnimationFrame( app.canvas.animate );
	}
	
	/*pans camera down*/
	app.canvas.animate.panDown = function() {
		if(app.canvas.animate.panDown.finished) return;
		
		if(!app.canvas.animate.panDown.once) {
			
			app.cache.pan = {};
			app.cache.pan.riseBack		= true;
			app.cache.pan.scale			= app.canvas.toScale;
			app.cache.pan.limit			= app.canvas.animate.panDown.limit;
			app.cache.pan.cloud;
			app.cache.pan.max			= app.canvas.cloudsLenght;
			
			app.cache.pan.background	= app.canvas.back;
			
			app.cache.pan.overalSpeed	= 0.9;
			
			app.cache.pan.backSpeed		= 0.9;
			app.cache.pan.cloudsSecondSpeed = 0.8;
			app.cache.pan.cloudsFirstSpeed	= 1;
			
			app.canvas.animate.panDown.once = true;
			
		}
		var pan = app.cache.pan;
		
		

		if(!pan.limit) {
			pan.limit = (pan.background.height * -1) + app.canvas.height;
			app.canvas.animate.panDown.limit = pan.limit;
		}
		
		
		if(pan.riseBack && pan.background.position.y > pan.limit) {
			if(pan.background.position.y - pan.backSpeed > pan.limit) {
				pan.background.position.y -= pan.backSpeed;
			} else {
				pan.background.position.y = pan.limit;
				app.canvas.animate.panDown.finished = true;
			}
			
			
			
			for(var i = 0; i < pan.max; i++) {
				pan.cloud = app.canvas.cache["cloud" + i];
				
				if(pan.cloud.isBack) {
					pan.cloud.y -= pan.cloudsSecondSpeed;
				} else {
					pan.cloud.y -= pan.cloudsFirstSpeed;
				}
				
			}
		}
	}
	
	/*moves clouds horizontally*/
	app.canvas.animate.moveClouds = function() {
		var cloud;
		var max = app.canvas.cloudsLenght;
		
		var multiplier = 1;
		
		for(var i = 0; i < max; i++) {
			cloud = app.canvas.cache["cloud" + i];
			
			if(cloud.x + Math.abs(cloud.width) <= 0 ) {
				if(cloud.width < 0) {
					cloud.x = app.canvas.width + Math.abs(cloud.width);
				} else {
					cloud.x = app.canvas.width;
				}
			} else {
				cloud.x -= (cloud.speed * multiplier);
			}

			/*if(cloud.x > app.canvas.width * -1) {
				cloud.x -= (cloud.speed * multiplier);
				//cloud.width += 0.1;
			} else {
				cloud.x = app.canvas.width;
				debugger;
			}*/
		}
	}
	
	
	app.canvas.animate.land = function() {
		if(app.canvas.animate.land.stop) {
			return;
		}
		
		var animator = app.canvas.animate.land;
		var layers = animator.layers;
		var layer;
		
		
		/*if(animator.container.y > 0) {
			animator.container.y -= 1.8;
		} else {
			animator.container.y = 0;
		}*/

		for(var i = 0; i < layers.length; i++) {
			layer = layers[i];
			
			if(layer.y > layer.baseY){
				layer.y -= layer.step;
			} else {
				layer.y = layer.baseY;
				animator.stop = true;
				
				app.canvas.demoInfo.className += " active";
			}
		}
		
		
	}
	
	
	app.canvas.animate.leaves = function() {
		var animator = app.canvas.animate.leaves;
		var leaves = animator.leaves;
		var leaf;
		
		
		for(var i = 0; i < leaves.length; i++) {
			leaf = leaves[i];
			
			if(leaf.i >= leaf.speed) {
				leaf.angle = 0;
				leaf.i = 0;
			}
			
			leaf.x = leaf.radius * Math.cos( leaf.angle ) + leaf.baseX + leaf.shiftX;
			leaf.y = leaf.radius * Math.sin( leaf.angle ) + leaf.baseY + leaf.shiftY;
			
			if(leaf.rotation < Math.doublePI) {
				leaf.rotation += leaf.rotate;
			} else {
				leaf.rotation = 0;
			}

			if(!leaf.shringDown) {
				leaf.scale.y -= 0.02;
				
				if(leaf.scale.y < -1 ) {
					leaf.shringDown = true;
				}
			} else {
				leaf.scale.y += 0.02;
				
				if(leaf.scale.y > leaf.baseScaleY ){
					leaf.shringDown = false;
				}
			}
			
			
			leaf.angle += leaf.step;
			leaf.i++;
			
			leaf.shiftX -= 2;
			leaf.shiftY += 0.5;
			
			if(leaf.x + leaf.width < 0) {
				leaf.shiftX = app.canvas.width + leaf.width;
				leaf.shiftY = 0;
			}
		}
		
	}
	
	app.init("content_area");
});