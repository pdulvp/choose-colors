/**
 * Author: pdulvp@gmail.com
 * Licence: CC BY-NC-SA
 */
var httpquery = require('@pdulvp/httpquery');
var Colors = require('@pdulvp/colors');
var JsonOp = require("@pdulvp/jsonop");
var Index = require("@pdulvp/index");
var Sources = require("@pdulvp/sources");
var Tips = require("@pdulvp/tip");

var Utils = {
	
	//From https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	uuid : function () {
	  return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	},
	
	clear: function(dom) {
		while (dom.firstChild) {
			dom.removeChild(dom.firstChild);
		}
		return dom;
	}

};


function htmlHeader(person, chart, light, message) {
	var color = getTint(person);
	var txt = person.name;
	var icon = `<div class="mr-3 ${person.icon} icon-15x" style="width:24px; height:24px; color:white"></div>`;
	if (chart != undefined) {
		txt = chart.name;
		icon = "";
	}
	if (message != undefined) {
		txt = message;
		icon = "";
	}

	if (light === true) {
		var hslColor = Colors.rgbToHsl(color[0], color[1], color[2]);
		hslColor[1] = 0.3;
		hslColor[2] = 0.8;
		color = Colors.hslToRgb(hslColor[0], hslColor[1], hslColor[2]);
	}
	color = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
	return `<div id="box_html_${person.id}" class="d-flex align-items-center p-2 text-white-50" style="background-color:${color}">
		${icon}
        <div class="lh-100">
		  <h6 class="mb-0 text-white lh-100">${txt}</h6>
        </div>
      </div>`;
}


//return the button for the given chart type and option. if no option, it return the main button of the chart type
function getButton(person, chart, opt) {
	if (opt == null) {
		return document.getElementById(`button_${person.id}_${chart.id}`);
	}
	return document.getElementById(`button_${person.id}_${chart.id}_${opt.id}`);
}

function createButton(person, chart, owner) {
	var buttonId = `button_${person.id}_${person.charts[i].id}`;
	let toolbar = "";
	toolbar+= 
	`<div class="btn-group btn-group-sm bg-white mr-1" role="group" aria-label="Basic example">
	<button data-article="${person.id}" data-chart="${person.charts[i].id}" class="btn btn-outline-secondary" id="${buttonId}" 
			type="button" data-owner="${owner}" aria-label="${person.charts[i].id}">
		<i aria-hidden="true" class="${person.charts[i].icon}"></i>
		<span class="sr-only">${person.charts[i].id}</span>
	</button>`;
	
	var multiOptions = person.charts[i].options.length > 1;
	if (multiOptions) {
		var options = person.charts[i].options.map
			(o => `<button data-article="${person.id}" data-chart="${person.charts[i].id}" data-option="${o.id}" data-owner="${owner}" id="${buttonId}_${o.id}" 
						   class="btn btn-secondary dropdown-item" href="#">${o.name}</button>`).join('');
		toolbar+= `
		<button data-article="${person.id}" data-chart="${person.charts[i].id}" class="btn btn-outline-secondary dropdown-toggle" id="${buttonId}_menu"
				type="button" aria-label="${person.charts[i].id}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
		</button>
		<div class="dropdown-menu" aria-labelledby="${buttonId}_menu">
			${options}
		</div>`
	}
	toolbar += `</div>`;
	return toolbar;
}

function createOption(person, chart, owner) {
	let toolbar = "";
	var buttonId = `button_${person.id}_${person.charts[i].id}`;
	var multiOptions = person.charts[i].options.length > 1 ? "": "d-none";
	var options = person.charts[i].options.map
		(o => `<option data-article="${person.id}" value="${o.id}" data-chart="${person.charts[i].id}" data-option="${o.id}" data-owner="${owner}" id="${buttonId}_${o.id}">${o.name}</option>`).join('');
		
	toolbar+= `
	<div class="input-group ${multiOptions}">
		<div class="input-group-prepend">
			<label class="input-group-text" for="inputGroupSelect01">Options</label>
		  </div>
		  <select id="${buttonId}" class="custom-select">
			${options}
		  </select>
	</div>`
	return toolbar;
}

function onClickButton(e) {
	Index.getIndex().then(function(index) {
				
		var control = e.target.closest("button");
		if (control == null || control == undefined) control = e.target.closest("option");
		if (control == null || control == undefined) control = e.target.closest("select").selectedOptions[0];
			
		var personId = control.getAttribute("data-article");
		var person = index.data.find(x => (x.id == personId));
		
		var chartId = control.getAttribute("data-chart");
		var optionId = control.getAttribute("data-option");
		var chartOwner = control.getAttribute("data-owner");
		var fieldValues = control.getAttribute("data-fieldValues");
		if (fieldValues != undefined) {
			fieldValues = JSON.parse(fieldValues);
		}
		if (fieldValues == null) {
			fieldValues = undefined;
		}
		
		var chart = person.charts.find(chart => chart.id === chartId);
		if (chart == undefined) {
			console.log("undefined chart:"+chartId);
			return;
		}
		var opt = chart.options.find(o => o.id === optionId);
		if (opt == undefined && chart.options.length > 0) {
			opt = chart.options[0];
		}
		createChart(person, chart, opt, chartOwner, fieldValues);
	
	});
}

 
 function copyToClip(text) {
	
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
 }
 
 let clipboard = new ClipboardJS('.clipboard-element');
 clipboard.on('success', function(e) {
	console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
	
    e.clearSelection();
});


function shareLinks(person, clazz) {
	 let url = `http://nd-live.pdul.org${person.href}`;
	 let result = "";
	result += `<div class="p-3 ${clazz} text-right" >
		<!--a href="http://www.twitter.com/share?url=${url}" class="btn btn-sm btn-outline-secondary mr-1 "><span class="icon-twitter" ></span></a>
		<a href="https://www.facebook.com/sharer/sharer.php?u=${url}" class="btn btn-sm btn-outline-secondary mr-1 "><span class="icon-facebook-squared"></span></a>-->
		<a role="button" tabindex="0" data-clipboard-text="${url}" data-toggle="popover" data-trigger="focus" data-content="Lien copié!" class="btn clipboard-element btn-sm btn-outline-secondary mr-1 "><span class="icon-share-1"></span></a>`;
	result += `</div>`; 
	return result;
}


function displayLight(message) {
	return `<div class="alert alert-light show box-shadow" role="alert">
	  ${message}
	</div>`;	
}

function displayInformation(message) {
	return `<div class="alert alert-secondary show" role="alert">
	  ${message}
	</div>`;	
}

function displayWarning(message, title) {
	let res = "";
	if (title != undefined) { 
		res += `<h5 class="alert-heading">${title}</h5>`;
	}
	res += `${message}`;
	return `<div class="alert-warning alert-dismissible fade show p-3" role="alert">
	  ${res}
	</div>`;	
}

function openModal(title, source) {
	$.ajax({
	  url: source,
	  dataType: 'json',
	  data: null,
	  success: function( json  ) {
		$('.offcanvas-collapse').removeClass('open');
		$('#modal-title').text(title);
		$('#modal-body').empty();
		$('#modal-body').append(json.content.join(''));
		$('#modal-dialog').modal('show');
	  }
	});
}

function mStats(kind, title, list) {
	query = list.join(', ');
	if (list.length == 0) query = "OK";
	style = kind == 0 ? "info" : (kind == 1 ? "warning" : "danger");
	if (style != "info" && list.length == 0) {
		style = "info";
	}
	result = `<div class="chart-table-column bd-callout-${style} chart-table-column-33">${title}</div><div class="chart-table-column chart-table-column-66 chart-table-column-center">${query}</div>`;
	return result;
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function getSection(index, tagId) {
	return index.mainSections.find(x => (x.tags != undefined && x.tags.includes(tagId)));
}

function getTag(index, tagId) {
	return index.tags.find(x => (x.id == tagId));
}

function getChart(index, chartType) {
	return index.charts.find(x => (x.type == chartType));
}

function getRenderList(index, renderId) {
	return index.renderList.find(x => (x.id == renderId));
}

function getPage(index, pageId) {
	let page = index.pages.find(x => (x.id == pageId));
	if (page == undefined) {
		$("#main").append(displayWarning(`Page '${pageId} 'not found`));
	}
	return page;
}
$( document ).ready(function() {
	
	//Ajout d'un message lors de preprod
	let staging = getCookie("staging");
	if (staging != undefined && staging != null) {
		let res = displayWarning(`<strong>STAGING VERSION : </strong> ceci est une version de développement du site. <br/>
			<a href="https://bitbucket.org/pdulvp/web-afsdpub/addon/pipelines/home#!/results/${staging}">Go to Pipelines Bitbucket #${staging}</a>`);
		$("#main").append(res);
		
		$("#site-info").text(" [TEMPORAIRE]");
		$(".navbar").removeClass("bg-dark");
		$(".navbar").removeClass("navbar-dark");
		$(".navbar").addClass("navbar-staging");
		$(".navbar").addClass("navbar-bg-danger");
	}
	
	let live = getCookie("live");
	if (live != undefined && live != null) {
		$("#site-info").text(" [LIVE]");
		if (false) {
		$(".navbar").removeClass("bg-dark");
		$(".navbar").removeClass("navbar-dark");
		$(".navbar").addClass("navbar-staging");
		$(".navbar").addClass("navbar-bg-warning");
		}
	}

	Index.getIndex().then(function(index) {
		$("#site-server").text(index.site.url.server);
		$("#site-extension").text(index.site.url.extension);
		
		$("#footer-title").text(index.site.title);
		$("#footer-moto").text(index.site.moto.short);
		$("#footer-copyright").html(index.site.copyright);
		
		let uri = window.location.pathname.split('/').filter(word => word.length > 0);

		//uri special cases
		if (uri[0] == "stats") {
			stats(index);
			return;
		}
		
		//Look for the article
		let article = null;
		if (uri.length > 0) {
			article = index.data.find(x => (x.id == uri[uri.length-1]));
		}
		if (article != null) {
			article.active = true;
			if (article.tags == undefined) {
				article.tags = [];
			}
		}
		
		//Look for existing sections. 
		//In priority, we put the one from URI if tags are consistents. 
		let sections = uri.map(u => index.mainSections.find(x => (x.id == u))).filter(u => u != undefined);
		//Sanity Check. An article shall have at least one tags of the exising sections. Otherwize, we remove the section
		if (article != null && sections.length>0) {
			sections = sections.filter( function (section) { return section.tags != undefined && section.tags.filter(t => -1 !== article.tags.indexOf(t)).length>0 });
		}
		//If no sections, we put the first one which are related to the article
		if (article != null && sections.length==0) {
			sections = index.mainSections.filter( function (section) { return section.tags != undefined && section.tags.filter(t => -1 !== article.tags.indexOf(t)).length>0 });
			if (sections.length > 1) {
				sections = [ sections[0] ];
			}
		}
		sections.forEach(s => s.active = true);
		
		//Initialize the nav dropdown menu
		let rightmenu = "";
		let modals = [];
		for (let i in index.mainSections) {
			let section = index.mainSections[i];
			if (section.mainTag != undefined && !section.mainTag)  {
				continue;
			}
			if (section.childSections == undefined)  {
				let style = (section.active) ? "active" : ""
				
				if (section.type=="modal")   {
					modals.push(section);
				}
				rightmenu+=`<li class="nav-item ${style}"><a id="${section.id}" class="nav-link" href="${section.href}" aria-label="${section.name}" data-source="${section.source}"><span class="mr-2 ${section.icon}"></span>${section.name}</a></li>`;
		    
			} else {
			  rightmenu+=`<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="mr-2 ${section.icon}"></span>${section.name}</a>
				<div class="dropdown-menu" aria-labelledby="dropdown01">`;
				
				for (let j in section.childSections)  {
					let childSection = section.childSections[j];
					if (childSection.type=="modal")   {
						modals.push(childSection);
					}
					rightmenu+=`<a id="${childSection.id}" class="dropdown-item btn-secondary" href="${childSection.href}" aria-label="${childSection.name}" data-source="${childSection.source}">${childSection.name}</a>`;
				}
			  rightmenu+=`</div></li>`;
			}
		}
		$("#right-menu-list").append(rightmenu);
		
		//Footer Links
		let pp = index.mainSections.map(s => s.childSections ? s.childSections : s).flat().filter(s => s.footerLink).map(s => `<li><a href="${s.href}">${s.name}</a></li>`).join("");
		$("#footer-list-links").html(pp);
		
		pp=index.mainSections.map(s => s.childSections ? s.childSections : s).flat().filter(s => s.footerAbout).map(s => `<li><a id="${s.id}-footer" aria-label="${s.name}" href="${s.href}" data-source="${s.source}">${s.name}</a></li>`).join("");
		$("#footer-list-about").html(pp);
		console.log(index);
		
		
		// Register modals for menu and footer
		for (let m in modals) {
			document.getElementById(modals[m].id).onclick = function sss(e) {
				let title = e.target.getAttribute("aria-label");
				let source = e.target.getAttribute("data-source");
				openModal(title, source);
			};
			document.getElementById(modals[m].id+"-footer").onclick = function sss(e) {
				let title = e.target.getAttribute("aria-label");
				let source = e.target.getAttribute("data-source");
				openModal(title, source);
			};
		}
		
		//Initialize the breadcrumb
		let bred = [];
		bred.push( { "id" : "#", "href" : "/", "name": "Accueil"} );
		
		let bredSections = (sections.map(function (section) { return { "id" : "#", "href" : section.href, "name": section.name} }));
		for (let i in bredSections) {
			bred.push(bredSections[i]);
		}
		if (article != null) {
			bred.push({ "id" : article.id, "href" : "#", "name": article.name});
		}
		//Remove the last link of the breadcrumb
		bred[bred.length-1].href=undefined;
		
		
		//render the breadcrumb
		let res = bred.map(function (x){ 
			let link = (x.href == undefined ? `${x.name}` : `<a href="${x.href}">${x.name}</a>` );
			return `<li class="breadcrumb-item">${link}</li>` }).join('');
		$("#breadcrumb-list").append(res);
		if (bred.length > 1) {
			$("#breadcrumb").removeClass("d-none");
		}
		if (uri.length > 0 && article == null && sections.length == 0) {
			let eee = displayWarning(`<strong>Oh oh!</strong> Cette page n'existe pas, mais pas de panique, voici la page d'accueil du site.`);
			$("#main").append(eee);
		}
		
		for (i in index.data) {
			let article = index.data[i];
			
			if (article.href == undefined) { 
				article.href = "/"+article.id;
				let localSections = sections;
				//If no sections, we put the first one which are related to the article
				if (localSections.length==0) {
					localSections = index.mainSections.filter( function (section) { return section.tags != undefined && section.tags.filter(t => -1 !== article.tags.indexOf(t)).length>0 });
					if (localSections.length>1) {
						localSections = [ localSections[0] ];
					}
				}
				if (localSections.length>0) {
					article.href = localSections[0].href+"/"+article.id;
				}
			}
		}
		
		let articles = index.data;
		articles = articles.filter(function (a) { return a.visible == undefined || a.visible == true } );
		
		let accueil = true;
		if (article != null) {
			articles = [article];
			accueil = false;
			
		} else if (sections.length > 0 && sections[0] != null) {
			articles = articles.filter( function (element) { return element.tags != undefined && element.tags.filter(t => -1 !== sections[0].tags.indexOf(t)).length>0 });
			accueil = false;
		}
		
		if (!accueil && articles.length == 0) {
			$("#main").append(displayWarning("Il n'y a pas encore d'articles pour cette section"));
		}
		
		let pageId = (accueil ? index.site.home.render : (article != null ? article.page : sections[0].page));
		let page = getPage(index, pageId);
		renderPage(page, { "index": index, "article": article, "mainSection": sections[0] }, "main");
		
		$("#footer").removeClass("d-none");
	});
});

function renderPage(page, source, owner, displayTitle) {
	let article = source.article;
	let mainSection = source.mainSection;
	let index = source.index;
	let tag = {};
	
	let style = "";
	for (r in page.renders) {
		let sources = [];
		if (page.renders[r].source == "article") {
			if (page.renders[r].value != undefined) {
				sources = index.data.filter(x => x.id == page.renders[r].value);
			} else {
				sources = [article];
			}
			
		} else if (page.renders[r].source == "tag") {
			let tagValue = page.renders[r].value;
			if (tagValue == "%mainSection.tags%" && mainSection.tags != undefined) {
				tagValue =  mainSection.tags[0];
			}
			sources = index.data.filter(x => x.tags.includes(tagValue));
			tag = getTag(index, tagValue);
			console.log(tag);
			console.log(sources);
		}
		
		let displayLink = tag.linkText != undefined && page.renders[r].displayLink == true;
		let displayTitle = (page.renders[r].displayTitle == true);
		style = page.renders[r].style != undefined ? page.renders[r].style : (style == "bg-white" ? "" : "bg-white");
		renderList(index, page.renders[r].id, "sections_"+Utils.uuid(), tag, sources, owner, style, displayLink, displayTitle, page.renders[r].renderValues);
	}
}

function appendSoutienLink(owner) {
	
}

function sendSample() {
	let links = document.getElementById("comment-response").getElementsByTagName("A");
	let currentId = "";
	if (links != undefined && links.length == 1) {
		currentId = "/?id="+links[0].getAttribute("data-id");
	}
	httpquery.post("https://set.transient-data.org", currentId, document.getElementById("textarea-comment").value).then(
	function( result ) {
		document.getElementById("comment-response").innerHTML=`La donnée est disponible à partir de <a data-id="${result.id}" href="https://get.transient-data.org/?id=${result.id}">ce lien</a>`;
	}).catch(function( json ) {
		alert("error");
		console.log(json);
	});
}

function home(index) {
	
	if (index.site.home.showMoto) {
		let res = displayInformation(index.site.moto.short); 
		$("#main").append(res);
	}
	
	if (index.site.showParticipate) {
		
		document.getElementById("accueil_link_support").href="#";
		document.getElementById("accueil_link_support").onclick = function () {
			$("#contrib").click();  
		};
			
		document.getElementById("accueil_link_suivi").href="#";
		document.getElementById("accueil_link_suivi").onclick = function () {
			$("#follow").click(); 
		};
	}
	

}

function createNews(index) {
	let result = `<div class="p-3 news" id="nouveautes">`;
	result += createHeader("Nouveautés");
	httpquery.get(index.site.news, "").then(
		function( json ) {
			let value = "";
			let classes = { "done":"icon-check", "current":"icon-target","todo":"icon-check-empty" };
			let titles = { "done":"Fini!", "current": "En cours", "todo":"A faire" };
			let todo = json.data.filter(x => classes[x.kind] != undefined);
			
			for (i in todo) {
				let item = json.data[i];
				let clz = classes[item.kind];
				let title = titles[item.kind];
				value += `<div class="news-${item.kind} d-flex"><div title="${title}" class="mr-3 pt-1 ${clz}"></div><div style="widht:100%">${item.text}</div></div>`;
				if (i<todo.length -1) {
					value += "<hr/>";	
				}
			}
			$("#nouveautes").append(value);
		});
	result += `</div>`;
	return result;
	
} 

function createHeader(title, i) {
	let result = `<h4>${title}</h4>`;
	return result;
}

function createInfo(index) {
	let articles = index.data.filter(x => x.visible == undefined || x.visible == true);
	let count = articles.length;
	let expense = 0;
	
	for (i in articles) {
		if (articles[i].stats != undefined) {
			if (articles[i].stats.expense != undefined && articles[i].stats.expense > 0) {
				expense+=articles[i].stats.expense;
			}
		}
	}
	expense = numberWithCommas(""+expense);
	let result = `Il y a seulement <b style="color:#8888AA;">${count}</b> articles sur ce site, 
				  mais déjà <b style="color:#8888AA;">${expense}€</b> de dépense publique référencée`;

	let title = "Statistiques";
	let titleHeader = createSimpleHeader(title);
	var div = `<div class="p-3 invert-color-light box-shadow">${titleHeader}<div class="pb-3 px-3 classinfo">${result}</div></div>`;
	return div;
}

function createHeader33(title) {
	let titleHeader = `<div class="d-flex align-items-center p-2 text-white-50" style="background-color:#687b8c; text-transform:uppercase">
        <div class="lh-100"><h6 class="mb-0 text-white lh-100">${title}</h6></div>
      </div>`;
	 return titleHeader;
}

function createHeader34(title) {
	let titleHeader = `<div class="d-flex align-items-center p-2 text-white-50" style="background-color:#687b8c; text-transform:uppercase">
        <div class="lh-100"><h5 class="mb-0 text-white lh-100">${title}</h5></div>
      </div>`;
	 return titleHeader;
}

function createSimpleHeader(title) {
	if (title != undefined && title.length > 0) {
		return `<h4 class="mb-4 lh-100">${title}</h4>`;
	}
	return "";
}

function createParagraphe(description) {
	if (description != undefined && description.length > 0) {
		return `<p>${description}</p>`;
	}
	return "";
}


function initWait(person, chart, owner) {
	let message = "";
	$( `#${owner}`).append( `<div id="chart_wait_${person.id}_${chart.id}" class="my-3" style="text-align:center;">
		<a aria-hidden="true" class="icon-circle-notch animate-spin icon-2x" style="color:${person.tint}"></a><div id="chart_wait_info_${person.id}">${message}</div><div>` );	
}
function updateWait(person, chart, message) {
	$( `#chart_wait_info_${person.id}_${chart.id}`).text(message);
}
 
function dismissWait(person, chart) {
	$( `#chart_wait_${person.id}_${chart.id}`).remove();
}

function renderList(index, renderer, id, tag, articles, owner, style, displayLink, displayTitle, value) {
	let renderId = getRenderList(index, renderer);
	if (renderId.module !== undefined) {
		let render = require(renderId.module);
		if (render !== undefined) {
			let uuid = Utils.uuid();
			let padding = (render.isFull ? "" : "p-3 main-section");
			let res = `<div class="${padding} ${style}">`;
			if (displayTitle) {
				res += createSimpleHeader(tag.name);
				res += createParagraphe(tag.description);
			}
			res += `<div id="${uuid}" />`;
			if (displayLink) {
				res += `<p class="text-center mt-3"><a href='${tag.href}' class='btn btn-outline-secondary' data-dismiss='modal'>${tag.linkText}</a></p>`;
			}
			res += `</div>`;
			$("#"+owner).append(res);
			if (render.setValue) {
				render.setValue(value);
			}
			render.render(index, articles, `${uuid}`).then(function () {
				//dismissWait(person, chart);
			});
		}
	}
}

function createChart(person, chart, opt, owner, fieldValues) {
	console.log(fieldValues);
	for (i in person.charts) {
		var mainBtn = getButton(person, person.charts[i], null);
		if (mainBtn != null) {
			if (chart.id == person.charts[i].id) {
				$("#"+mainBtn.id).addClass("active");
			} else {
				$("#"+mainBtn.id).removeClass("active");
			}
		}
		
		for (o in person.charts[i].options) {
			var optBtn = getButton(person, person.charts[i], person.charts[i].options[o]);
			if (optBtn != null) {
				if (opt != null && opt.id == person.charts[i].options[o].id) {
					$("#"+optBtn.id).addClass("active");
				} else {
					$("#"+optBtn.id).removeClass("active");
				}
			}
		}
	}
	
	Utils.clear( document.getElementById(owner) );
	
	let res = "";
	if (chart.hideWithoutFieldValues === true && (fieldValues == undefined || fieldValues.length == 0)) {
	//	return res;
	}
	
	if (chart.module !== undefined) {
		initWait(person, chart, owner);
		let render = require(chart.module);
		if (render !== undefined) {
			Index.getIndex().then(function(index) {
				render.render(index, person, chart, opt, owner, fieldValues).then(function () {
					dismissWait(person, chart);
				});
			});
		}
		return;
	}

	console.warn("legacy chart rendering:" + chart.type);
}

function getSources(person) {
	
	return new Promise((resolve, reject) => {
		Index.getIndex().then(function(index) {
			
			let visitedSources = [];
			let directSources = [];
			for (c in person.charts) {
				let chart = person.charts[c];
				for (o in chart.options) {
					let opt = chart.options[o];
					if (opt.source != undefined && directSources.indexOf(opt.source) == -1) {
						directSources.push(opt.source);
					}
				}
			}
			
			console.log(directSources);
			let finalSources = [];
			while (directSources.length > 0) {
				let current = directSources.shift();
				console.log(current);
				
				console.log(visitedSources.indexOf(current));
				if (current != undefined && visitedSources.indexOf(current) == -1) {
					visitedSources.push(current);
					let s = index.sources[current];
					if (s != undefined && s.sources != undefined) {
						for (i in s.sources) {
							if (directSources.indexOf(s.sources[i]) == -1) {
								directSources.push(s.sources[i]);
							}
						} 
					} else if (s != undefined && s.source != undefined) {
						finalSources.push(s);
					}
				}
			}
			resolve(finalSources);
		});
	});
	
}

// First define your cloud data, using `text` and `size` properties:

function goUp(person, chart, owner) {
	$( `#${owner}`).append( `<div class="my-3" style="text-align:center;"><a aria-hidden="true" href="#box_chart_${person.id}_${chart.id}" class="icon-angle-circled-up icon-2x" style="color:${person.t
	}"></a><div>` );	
}

function chartReload(e) {
	onClickButton(e);
}
function addReload(person, chart, opt, owner) {
	var buttonId = `button_${person.id}_${chart.id}_${o.id}_reload`;
	let button = `<button data-article="${person.id}" data-chart="${chart.id}" data-option="${opt.id}" data-owner="${owner}" id="${buttonId}" class="btn btn-link icon-arrows-cw icon-2x" style="color:${person.tint} href="#"></button>`
	
	$( `#${owner}`).append( `<div class="my-3" style="text-align:center;">${button}<div>` );
	
	let btn = document.getElementById(`${buttonId}`);
	if (btn != null) {
		btn.onclick = chartReload;
	}
}
	
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }
}

function adaptData(data, opt) {
	if (opt.filter == "positive") {
		data = data.filter(x => formatValue(x[opt.field]) > 0);		
	}
	if (opt.orderField != undefined) {
		var order = opt.order === "desc" ? 1 : -1;
		data.sort(function (a,b) { return (order * formatValue(b[opt.orderField]) + (-order) * formatValue(a[opt.orderField])); } );
	}
	if (opt.limit > 0) {
		var start = opt.start > 0 ? opt.start : 0;
		data = data.slice(start, opt.limit);
	}
	return data;
}

function updatePopovers() {
	$('[data-toggle="popover"]').popover(); 
}

const numberWithCommas = (x) => {
	if (x == undefined) {
		return "0";
	}
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

function getTint(person) {
	return Colors.hex2rgb(person.tint);
}

//Returns a Float from a formatted String.
function formatValue(value) {
	if (value == undefined) return 0;
	value = ""+value;
	let result = parseFloat(value.replace(" ", "").replace(" ", "").replace(" ", "").replace(",", ""));
	if (isNaN(result)) {
		return value;
	}
	return result;
}

//Returns the value to the given string format.
function formatLabel(labelFormat, value) {
	
	let isNumber = false;
	let v = "";
	if (!Array.isArray(value)) {
		value = [value];
		isNumber = true;
	}
	
	v = labelFormat;
	for (let g in value) {
		let format = value[g]; 
		if (isNumber) {
			format = numberWithCommas(format);
		}
		if ("Fonctionnement" == format) {
			format = "des frais de fonctionnement";
		}
		let tore = "%"+(parseInt(g)+1);
		v = v.replace(tore, format);
	}

	return v;
}





