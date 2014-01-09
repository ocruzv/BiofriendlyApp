// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

		var latitude, longitude;
		var mylatitud, mylongitude;
		var cerca = 100000000;
		var nameCerca = "";
		var latitudCerca, longitudCerca;

		$$(document).ready(function() {
			Lungo.init({});

			onInit();



			function onInit() {
			    var updated = checkDB();
			    if (!updated) {
			        newJSONDB();
			    }
			}

			function newJSONDB() {
			    var param = {
			        peticion: "sucursales"
			    };
			    $$.post("http://www.itievents.net/app_bio/api.php", param, function(i) {
			        localStorage.setItem("jsonDB", JSON.stringify(i));
			        //alert (localStorage.getItem("jsonDB"));
			        // alert("Base de datos actualizada");
			    }, 'json');
			}


			function checkDB() {
			    var parametros = {
			        peticion: "versionDB"
			    };

			    localStorage.removeItem("dbVersion");
			    var post = $$.post("http://www.itievents.net/app_bio/api.php", parametros, function(i) {
			        if (localStorage.getItem("dbVersion") === null) {
			            localStorage.setItem("dbVersion", JSON.stringify(i[0].info_version));
			            return false;
			        } else {
			            var clean = localStorage["dbVersion"];
			            clean = clean.replace('"', '');
			            clean = clean.replace('"', '');
			            alert(clean);
			            var intVersion = parseFloat(clean);
			            alert(intVersion);
			            if (intVersion < parseFloat(i[0].info_version)) {
			                localStorage.setItem("dbVersion", JSON.stringify(i[0].info_version));
			                return false;
			            } else {
			                return true;
			            }
			        }


			    }, 'json');
			}

			navigator.geolocation.getCurrentPosition(onSuccess, onError);

				function onSuccess(position) {
					mylatitude = position.coords.latitude;
					mylongitude = position.coords.longitude;
					//alert("Tu posición es: " + mylatitude + " , " + mylongitude);

					exitoQuery();

					function exitoQuery() {
						var cacheJson = JSON.parse(localStorage.getItem("jsonDB"));
						$$.each(cacheJson, function(index, data) {
							var latitudFutura = parseFloat(data.latitud);
							var longitudFutura = parseFloat(data.longitud);
							var pc = puntoCercano(mylatitude, latitudFutura, mylongitude, longitudFutura);
							if (cerca == -1 || pc < cerca) {
								cerca = pc;
								nameCerca = data.name;
								latitudCerca = data.latitud;
								longitudCerca = data.longitud;
							}
						});
					}

					function puntoCercano(lat1, lat2, lon1, lon2) {
						var R = 6371; // km
						var dLat = (lat2 - lat1) * (Math.PI / 180);
						var dLon = (lon2 - lon1) * (Math.PI / 180);
						lat1 = lat1 * (Math.PI / 180);
						lat2 = lat2 * (Math.PI / 180);
						var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
						var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
						var d = R * c;
						return d;
					}
				}

				function onError(error) {
					alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
				}

			// On App Load

			checkStatus();

			function checkStatus() {
				if (!localStorage.getItem('nombre')) {
			        Lungo.Router.section('login');
			    } else {
			        $$("#main-article").html("Hola, " + localStorage.getItem("nombre") + "!");
			    }
			}

			Lungo.dom('#registrarse').on('tap', function() {

				Lungo.Router.section('registro');

			});

			Lungo.dom('#recuperarPass').on('tap', function() {

				Lungo.Router.section('recuperar');

			});

			Lungo.dom('#login').on("submit", function(event) {

				event.preventDefault();

				var user = $$(this).find("#user").val();
				var pass = $$(this).find("#password").val();

				if (user === '' || pass === '') {
					alert("Asegurate de haber llenado los datos");
				} else {
						$$.ajax({
						type : "POST",
						url : "http://www.itievents.net/app_bio/login.php",
						data : {
							user : user,
							password : pass
						},
						dataType : "json",
						success : function(result) {
							if(result.result == "OK") {
								localStorage.setItem("id", result.data.id);
								localStorage.setItem("nombre", result.data.nombre);
								localStorage.setItem("password", result.data.password);
								localStorage.setItem("email", result.data.email);
								localStorage.setItem("celular", result.data.celular);
								localStorage.setItem("cilindraje", result.data.cilindraje);
								Lungo.Router.section('main_section');
							} else {
								alert("Error: " + result.error);
							}
						}
					});
				}

			});

			Lungo.dom('#register').on("submit", function(event) {

				event.preventDefault();
				
				var nombre = $$(this).find("#nameuser").val();
				var password = $$(this).find("#password").val();
				var email = $$(this).find("#email").val();
				var cellphone = $$(this).find("#cellphone").val();
				var cilindraje = $$(this).find("#cilindraje").val();
 	
				if(nombre === '' || password === '' || email === '' || cellphone === '' || cilindraje === '') {
					alert("Todos los campos son obligatorios");
				} else {
				
					$$.ajax({
						type: "POST",
						url: "http://www.itievents.net/app_bio/insert.php",
						data: {
							nameuser : nombre,
							password : password,
							email : email,
							cellphone : cellphone,
							cilindraje : cilindraje
						},
						dataType: 'text',
						success: function(result) {
							alert(result);
							Lungo.Router.section('main_section');
						},
						error: function(xhr, type) {
							alert("Error en el registro: " + xhr);
						}
					});
					
				}
			});	

			Lungo.dom("#recuperar").on("load", function() {
				Lungo.dom("#recuperarpass").on("submit", function(event) {
					event.preventDefault();

					var emailrecupera = $$(this).find("#emailrecuperar").val();

					if(emailrecupera=='') {
						alert('Ingresa tu correo electrónico');
					} else {
						$$.ajax({
							type: "POST",
							url: "http://www.itievents.net/app_bio/recuperar.php",
							data: {
								user : emailrecupera
							},
							success: function(result) {
								alert(result.message);
								if (result.result=='OK') {
									Lungo.Router.section('login');
								}
							},
							error: function(xhr, type) {
								alert("Error al ejecutar acción: " + xhr);
							}
						});
					}
				});
			});

			

			Lungo.dom('#main_section').on('load', function() {
				checkStatus();
			});

			Lungo.dom('#noticias').on('load', function(event){
				letsReader("http://biofriendly.com/blog/feed/");
			});

			Lungo.dom('#reto').on('load', function() {

				if (localStorage["kmrAntes"]) {
					Lungo.dom('#retoAntesLink span').removeClass('remove-sign').addClass('ok-sign');
				}

				if (localStorage["kmrDespues"]) {
					Lungo.dom('#retoDespuesLink span').removeClass('remove-sign').addClass('ok-sign');
				}

				if (localStorage["kmrAntes"] && localStorage["kmrDespues"]) {
					var antes=parseInt(localStorage["kmrAntes"]);
					var despues=parseInt(localStorage["kmrDespues"]);

					Lungo.dom("#resultadosReto").html("<h1>Resultados:</h1><strong>Has ahorrado " + (despues-antes) + " KM gracias a Biofriendly!</strong>");
				}
			});

			
			Lungo.dom('#retoAntes').on('load', function() {

				if(localStorage["kmiAntes"] && localStorage["ltrAntes"] && localStorage["kmfAntes"]) {
					$$('#kminisin').val(localStorage["kmiAntes"]);
					$$('#ltssin').val(localStorage["ltrAntes"]);
					$$('#kmfinsin').val(localStorage["kmfAntes"]);
				}

				Lungo.dom("#antesBiof").on("submit", function(event) {
					event.preventDefault();

					var kminisin = $$('#kminisin').val();
					var ltssin = $$('#ltssin').val();
					var kmfinsin = $$('#kmfinsin').val();

					localStorage["kmiAntes"] = kminisin;
					localStorage["ltrAntes"] = ltssin;
					localStorage["kmfAntes"] = kmfinsin;
					localStorage["kmrAntes"] = parseInt(kmfinsin) - parseInt(kminisin);

					Lungo.Notification.html('<h1>Datos guardados</h1>', "Cerrar", "", 3);

					Lungo.Router.section("reto");
				});
			});

			Lungo.dom('#retoDespues').on('load', function() {

				if(localStorage["kmiDespues"] && localStorage["ltrDespues"] && localStorage["kmfDespues"]) {
					$$('#kminicon').val(localStorage["kmiDespues"]);
					$$('#ltscon').val(localStorage["ltrDespues"]);
					$$('#kmfincon').val(localStorage["kmfDespues"]);
				}

				Lungo.dom("#despuesBiof").on("submit", function(event) {
					event.preventDefault();

					var kminicon = $$('#kminicon').val();
					var ltscon = $$('#ltscon').val();
					var kmfincon = $$('#kmfincon').val();

					localStorage["kmiDespues"] = kminicon;
					localStorage["ltrDespues"] = ltscon;
					localStorage["kmfDespues"] = kmfincon;
					localStorage["kmrDespues"] = parseInt(kmfincon) - parseInt(kminicon);

					Lungo.Notification.html('<h1>Datos guardados</h1>', "Cerrar", "", 3);

					Lungo.Router.section("reto");
				});
			});

			Lungo.dom('#cerca').on('load', function() {

				function showRoute() {
					var start = new google.maps.LatLng(mylatitude, mylongitude);
					var end = new google.maps.LatLng(latitudCerca, longitudCerca);
					var request = {
						origin: start,
						destination: end,
						travelMode: google.maps.DirectionsTravelMode.DRIVING
					};
					directionsService.route(request, function(response, status) {
						if (status == google.maps.DirectionsStatus.OK) {
							directionsDisplay.setDirections(response);
							var leg = response.routes[0].legs[0];
							makeMarker(leg.start_location, icons.start, "title");
							makeMarker(leg.end_location, icons.end, 'title');
						}
					});

					$("#nombreCercano").html("<strong>" + nameCerca + "</strong>");
				}

				function makeMarker(position, icon, title) {
					new google.maps.Marker({
						position: position,
						map: map,
						icon: icon,
						title: title
					});
				}

				var directionsDisplay;
				var directionsService = new google.maps.DirectionsService();
				var map;

				// Start/Finish icons
				var icons = {
					start: new google.maps.MarkerImage(
					// URL
					"file:///android_asset/www/img/start2.png",
					// (width,height)
					new google.maps.Size(38, 53),
					// The origin point (x,y)
					new google.maps.Point(0, 0),
					// The anchor point (x,y)
					new google.maps.Point(22, 53)),
					end: new google.maps.MarkerImage(
					// URL
					"file:///android_asset/www/img/end2.png",
					// (width,height)
					new google.maps.Size(38, 53),
					// The origin point (x,y)
					new google.maps.Point(0, 0),
					// The anchor point (x,y)
					new google.maps.Point(22, 53))
				};

				initialize();

				function initialize() {
					var myLatlng = new google.maps.LatLng(mylatitude, mylongitude); 
					directionsDisplay = new google.maps.DirectionsRenderer();
					var mapOptions = {
						zoom: 18,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						center: myLatlng
					};
					map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

					directionsDisplay.setMap(map);
					directionsDisplay.setOptions({
						suppressMarkers: true
					});
					showRoute();
				}

			});

			Lungo.dom('#directorio').on('load', function() {
				$$("li").on("tap", function() {
					localStorage["Estado"] = $$(this).attr('info');
					$$("#listaUl").html("");

					var cacheJson = JSON.parse(localStorage.getItem("jsonDB"));
					$$.each(cacheJson, function(index, data){
						if(data.estado === localStorage["Estado"]) {
							$$("#listaUl").append("<li><p>" + data.name + "</p><p>" + data.direccion + "</p></li>");
						}
					});

					/*if (Lungo.Core.environment().os.name.toLowerCase() === 'android') {
					  $$('#listaSucursales').css('overflow-y', 'hidden');
					  // Browser must be allowed perform stuff from the hidden first so we delay the revert
					  setTimeout(function() { 
					    $$('#listaSucursales').css('overflow-y', 'scroll');
					  }, 1);
					}*/
				});
			});

			Lungo.dom("#cerrarSesion").on('tap', function() {
				localStorage.clear();
				//Lungo.Router.section('login');
			});

			Lungo.dom('#comparte').on('load', function() {
				$$('#fraseShare').on('change', function() {
					if ($$(this).val() == '2') {
						$$('.hideShare').show();
					} else {
						$$('.hideShare').hide();
					}
				});

				Lungo.dom("#TwitterShare").tap(function() {
					var fraseValue = getFrase();
					publishTwitter(fraseValue);
				});

				Lungo.dom("#FaceShare").tap(function() {
					var fraseValue = getFrase();
					localStorage.removeItem("fbToken");
					if (localStorage.getItem("fbToken") === null) {
						loginFacebook(fraseValue);
					} else {
						publishFacebook(fraseValue);
					}
				});

				function getFrase() {
					var shareValue = Lungo.dom("#fraseShare").val();
					var fraseValue;
					if (shareValue != 2) {
						fraseValue = Lungo.dom("#fraseShare option[value='" + shareValue + "']").text();
					} else {
						fraseValue = Lungo.dom("#textoPersonal").val();
					}
					return fraseValue;
				}

				function publishTwitter(fraseValue) {
					fraseValue = fraseValue.replace(/ /g, "%20");
					fraseValue = fraseValue.replace("#", "%23");
					var via = "&via=BiofriendlyMx";
					var text = "&text=" + fraseValue;
					var urlTwitter="https://twitter.com/share?url=" + via + text;
					var wBrowser = window.open(urlTwitter, '_blank', 'location=no');
					wBrowser.addEventListener('loadstart', function(event) {
						if (event.url.match(/complete/)) {
							alert("¡Publicado!");
							wBrowser.close();
							wBrowser.removeEventListener('loadstart');
						}
					});
				}

				function publishFacebook(fraseValue) {
					var data = {
						access_token: localStorage.getItem("fbToken"),
						message: fraseValue,
						method: "POST"
					};

					$$.json("https://graph.facebook.com/feed", data, function(json) {
						//alert(JSON.stringify(json));
						alert("¡Publicado!");
					});
				}

				function loginFacebook(fraseValue) {
					var Biof = { 
						APP_ID: "501120679963157", 
						CLIENT_SECRET: "35ec8cf25313301fef0b74fb19ef4954", 
						WEBSITE_URL: "http://www.itievents.net/app_bio/token.html" 
					};

					var urlant = 0;

					var url = "https://m.facebook.com/dialog/oauth/?response_type=token&scope=publish_stream&client_id=" + Biof.APP_ID + "&redirect_uri=" + Biof.WEBSITE_URL;
				
					var wBrowser = window.open(url, '_blank', 'location=no');

					wBrowser.addEventListener('loadstart', function(event) {

						if (event.url.match(/token_obtenido/g)) {
							var access_token = getUrlVars(urlant)["access_token"];
							localStorage.setItem("fbToken", access_token);
							publishFacebook(fraseValue);
							wBrowser.close();
							wBrowser.removeEventListener('loadstart');
						}
						urlant = event.url;
					});

				}

				function getUrlVars(url) { 
					var vars = [], hash;
					var hashes = url.slice(url.indexOf('#') + 1).split('&');
					for(var i = 0; i < hashes.length; i++) { 
						hash = hashes[i].split('='); 
						vars.push(hash[0]); vars[hash[0]] = hash[1]; 
					}
					return vars; 
				}


			});

		});

		function letsReader(feed) {
			Lungo.dom('.feedList').html('');
			$$.ajax({
			  url      : 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&q=' + encodeURIComponent('http://biofriendly.com/blog/feed/') + '&callback=?',
			  dataType : 'json',
			  success: function (response) {
			    if (response.responseData.feed && response.responseData.feed.entries) {
			      $$.each(response.responseData.feed.entries, function (i, e) {
			      	Lungo.dom('.feedList').append('<li><h1>' + e.title + '</h1>' + e.content + '</li>');
			      });
			    }
			  },
			  error: function(xhr, type) { 
			  	console.log(xhr);
			  }
			});
		}

}
