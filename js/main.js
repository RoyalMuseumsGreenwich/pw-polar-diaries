///////////////////////////////////
/////	
/////	JS for SimpleImageBrowser
/////	Ver 0.2
/////	
/////	braithby@rmg.co.uk
/////	
///////////////////////////////////

// Only start JS when the document is ready
$(document).ready(function(){
	
	// $(document).on("contextmenu", function(e){
	// 	e.preventDefault();
	// });
	
	console.log("Document ready");
	main();
});


///////////////////////////////////
/////	++ GLOBAL VARIABLES ++

var debugMode = false;

var xmlPathAndFilename = "xml/data.xml";
var xmlDoc;
var quoteArray = [];
var glossaryArray = [];
var authorArray = [];
var activeCategoryQuoteIndexes = [];

var attractModeActive = true;
var inactivityTimer;
var inactivityTimerMax;

var stillThereCountdownHandler;
var stillThereCountdown;
var stillThereCountdownMax = 10;

var uiImagePath = "";
var thumbImagePath = "";
var largeImagePath = "";
var imageObjectArray = [];


var carouselToImageGroupIdLookup = [];

/////	-- GLOBAL VARIABLES --
///////////////////////////////////



///////////////////////////////////
/////	++ DEBUG & ERROR FUNCTIONS ++

function consoleLogError(errorType, errorCode, errorTitle, errorBody){
	if(debugMode == true){
		//console.log(errorType + "(" + errorCode + ") >> " + errorTitle + " -- " + errorBody);
		console.log(errorTitle + "\n\n" + errorType + " > " + errorCode + "\n" + errorBody);
	}
}

function consoleLogMessage(msgTitle, msgBody){
	if(debugMode == true){
		console.log(">>" + msgTitle + "\n" + msgBody);
	}
}

function alertError(errorType, errorCode, errorTitle, errorBody){
	if(debugMode == true){
		window.alert(errorTitle + "\n\n" + errorType + " > " + errorCode + "\n" + errorBody);
	}
}

function updateDebugQuoteChecker(quoteArrayIndex){
	
	var thisQuote = quoteArray[quoteArrayIndex];
	
	$("#debugQuoteCheckerNumber span").html(thisQuote.myQuoteObjectNumber);
	$("#debugQuoteCheckerImageCode span").html(thisQuote.myQuoteObjectImageCode);
	$("#debugQuoteCheckerImageObjectImageNumber span").html(thisQuote.myQuoteObjectImageObject.myImageObjectNumber);
	$("#debugQuoteCheckerImageObjectImageCode span").html(thisQuote.myQuoteObjectImageObject.myImageObjectCode);
	$("#debugQuoteCheckerImageObjectImageThumbFileName span").html(thisQuote.myQuoteObjectImageObject.myImageObjectThumbFileName);
	$("#debugQuoteCheckerImageObjectIimageLargeFileName span").html(thisQuote.myQuoteObjectImageObject.myImageObjectLargeFileName);
	$("#debugQuoteCheckerImageObjectImageCredit span").html(thisQuote.myQuoteObjectImageObject.myImageObjectCredit);
	$("#debugQuoteCheckerImageObjectImageApproved span").html(thisQuote.myQuoteObjectImageObject.myImageObjectApproved);
	$("#debugQuoteCheckerBody span").html(thisQuote.myQuoteObjectBody);
	$("#debugQuoteCheckerAuthor span").html(thisQuote.myQuoteObjectAuthor);
	$("#debugQuoteCheckerImageDescription span").html(thisQuote.myQuoteObjectImageDescription);
	$("#debugQuoteCheckerDate span").html(thisQuote.myQuoteObjectDate);
	$("#debugQuoteCheckerObjectName span").html(thisQuote.myQuoteObjectObjectName);
	$("#debugQuoteCheckerPageNumber span").html(thisQuote.myQuoteObjectPageNumber);
	$("#debugQuoteCheckerAccessionNumber span").html(thisQuote.myQuoteObjectAccessionNumber);
	$("#debugQuoteCheckerCategory span").html(thisQuote.myQuoteObjectCategory);
	
}

function addDebugListeners(){
	$("#toggleDebugScreenVizButton").click(function(){
		toggleDebugScreenViz();
	});
	$("#refreshPageButton").click(function(){
		refreshPage();
	});
}

function toggleDebugScreenViz(){
	$("#debugWrapper").toggle("fast", function(){
		// Debug screen
	});
}

function addKeyboardListeners(){
	$(document).keypress(function(e) {
		if(e.keyCode == 100){
			// "d" pressed on keyboard to toggle Debug screen viz
			toggleDebugScreenViz();
		}else if(e.keyCode == 112){
			// "p" pressed on keyboard to refresh page
			refreshPage();
		}else if(e.keyCode == 114){
			// "r" pressed on keyboard to rotate to next
			resetAllCarousels();
		}else if(e.keyCode == 97){
			// "a" pressed on keyboard to toggle attract mode
			if(attractModeActive == true){
				endAttract();
			}else{
				startAttract();
			}
		}
		//alert("You pressed " + e.keyCode);
	});
}

function refreshPage(){
	location.reload(true);
}

/////	-- DEBUG & ERROR FUNCTIONS --
///////////////////////////////////


function main(){
	//DEBUG
	consoleLogMessage(arguments.callee.name + "()", arguments.callee.name + "() function called and began execution");
	// Begin the XML collection and processing
	loadXml();
	// Setup listeners
	addDebugListeners();
	addKeyboardListeners();
	addUIListeners();
	loopAttractFade();
}

function loadXml(){
	//DEBUG
	consoleLogMessage(arguments.callee.name + "()", arguments.callee.name + "() function called and began execution - attempting to load [" + xmlPathAndFilename + "]");
	// Load the xml file using ajax
	$.ajax({
		type: "GET",
		url: xmlPathAndFilename,
		dataType: "xml",
		success: function(xml){
			consoleLogMessage("XML loaded", "XML data loaded from \"" + xmlPathAndFilename + "\"");
			xmlDoc = xml;
			processXml();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	});
}

function processXml(){
	//DEBUG
	consoleLogMessage(arguments.callee.name + "()", arguments.callee.name + "() function called and began execution - attempting to process [" + $(xmlDoc) + "]");
	
	$xml = $(xmlDoc);
	
	// Variables used for debug
	$debugModeEnabledFromXml = $xml.find("debugModeEnabled").text();
	if($debugModeEnabledFromXml != "true"){
		debugMode = false;
	}
	
	// Set text for Debug screen
	$applicationNameFromXml = $xml.find("applicationName").text();
	$applicationVersionNumberFromXml = $xml.find("applicationVersionNumber").text();
	$("#applicationNameAndVersionH1").html($applicationNameFromXml + " <span class=\"threeQuarterText\">Ver. " + $applicationVersionNumberFromXml + "</span>");
	
	$updateDeveloperFromXml = $xml.find("updateDeveloper").text();
	$updateDateFromXml = $xml.find("updateDate").text();
	$("#applicationUpdateDeveloperAndDateH3").html($updateDeveloperFromXml + " (" + $updateDateFromXml + ")");
	
	$applicationCommentFromXml = $xml.find("applicationComment").text();
	$("#applicationCommentP").html($applicationCommentFromXml);
	
	
	// Variables used for Attract screen
	$attractMessageHeadFromXml = $xml.find("attractMessageHead").text();
	$("#attractMessageHeadH3").html($attractMessageHeadFromXml);
	$attractMessageSubheadFromXml = $xml.find("attractMessageSubhead").text();
	$("#attractMessageSubheadH1").html($attractMessageSubheadFromXml);
	$attractMessageBodyFromXml = $xml.find("attractMessageBody").text();
	$("#attractMessageBodyP").html($attractMessageBodyFromXml);
	
	// Variables used for Attract screen
	$mainMenuScreenHeadingFromXml = $xml.find("mainMenuScreenHeading").text();
	$("#mainMenuScreenHeadingText").html($mainMenuScreenHeadingFromXml);
	$mainMenuScreenBodyTextFromXml = $xml.find("mainMenuScreenBodyCopy").text();
	$("#mainMenuScreenBodyText").html($mainMenuScreenBodyTextFromXml);
	
	$inactivityTimerMaxFromXml = $xml.find("timeoutMilliseconds").text();
	inactivityTimerMax = parseInt($inactivityTimerMaxFromXml);
	$("#applicationInactivityTimer").html("Inactivity timeout: " + (inactivityTimerMax/1000) + " seconds");
	
	// Set the values for the quote array
	var quoteCount = 0;
	
	//Used on the debug screen
	var stringForDebugQuoteList = "";
	
	$xml.find('quote').each(function(){
		var $thisQuote = $(this);
		var thisQuoteNumber = $thisQuote.attr("number");
		var thisQuoteImageCode = $thisQuote.find("imageCode").text();
		var thisQuoteImageObject;
		var thisQuoteBody = $thisQuote.find("body").text();
		var thisQuoteBodyLen = thisQuoteBody.length;
		var thisQuoteAuthor = $thisQuote.find("author").text();
		var thisQuoteImageDescription = $thisQuote.find("imagedescription").text();
		var thisQuoteDate = $thisQuote.find("date").text();
		var thisQuoteObjectName = $thisQuote.find("objectName").text();
		var thisQuotePageNumber = $thisQuote.find("pageNumber").text();
		var thisQuoteAccessionNumber = $thisQuote.find("accessionNumber").text();
		var thisQuoteCategory = $thisQuote.find("category").text();
		
		$xml.find('image').each(function(){
			var $thisImage = $(this);
			var thisImageNumber = $thisImage.attr("number");
			var thisImageCode = $thisImage.find("imageCode").text();

			if(thisImageCode == thisQuoteImageCode){
				var thisImageThumbFileName = $thisImage.find("thumbFileName").text();
				var thisImageLargeFileName = $thisImage.find("largeFileName").text();
				var thisImageCredit = $thisImage.find("credit").text();
				var thisImageApproved = $thisImage.find("approved").text();
				var thisImageLayout = parseInt($thisImage.find("layout").text());
				thisQuoteImageObject = new ImageObject(thisImageNumber, thisImageCode, thisImageThumbFileName, thisImageLargeFileName, thisImageCredit, thisImageApproved, thisImageLayout);
			}else{
				//return false;
			}
		});
		
		var thisQuoteObject = new QuoteObject(thisQuoteNumber, thisQuoteImageCode, thisQuoteImageObject, thisQuoteBody, thisQuoteBodyLen, thisQuoteAuthor, thisQuoteDate, thisQuoteObjectName, thisQuotePageNumber, thisQuoteAccessionNumber, thisQuoteCategory, thisQuoteImageDescription);
		
		// console.log(thisQuoteObject);

		quoteArray.push(thisQuoteObject);
		
		// console.log("There are " + (quoteCount+1) + " quote(s) and the infoArray has " + quoteArray.length + " item(s).");
		// console.log(">>>>>> quoteArray[" + quoteCount + "]:: " + quoteArray[quoteCount].myQuoteObjectImageObject);
		
		stringForDebugQuoteList += "<li class=\"debugQuoteLi\" quoteArrayIndex=\"" + quoteCount + "\"><span class=\"greenDebugText\">(" + thisQuoteNumber + ") " + thisQuoteObjectName + "</span></li>";
		quoteCount++;

	});
	
	
	$xml.find('entry').each(function(){
		var $thisGlossaryEntry = $(this);
		var thisGlossaryEntryNumber = $thisGlossaryEntry.attr("number");
		var thisGlossaryEntryImageCode = $thisGlossaryEntry.find("imageCode").text();
		var thisGlossaryEntryImageObject;
		
		$xml.find('image').each(function(){
			var $thisImage = $(this);
			var thisImageNumber = $thisImage.attr("number");
			var thisImageCode = $thisImage.find("imageCode").text();
			
			if(thisImageCode == thisGlossaryEntryImageCode){
				var thisImageThumbFileName = $thisImage.find("thumbFileName").text();
				var thisImageLargeFileName = $thisImage.find("largeFileName").text();
				var thisImageCredit = $thisImage.find("credit").text();
				var thisImageApproved = $thisImage.find("approved").text();
				thisGlossaryEntryImageObject = new ImageObject(thisImageNumber, thisImageCode, thisImageThumbFileName, thisImageLargeFileName, thisImageCredit, thisImageApproved);
			}else{
				//return false;
			}
		});
		
		var thisGlossaryEntryTerms = $thisGlossaryEntry.find("terms");
		var thisGlossaryEntryTermArray = [];
		$thisGlossaryEntry.find("term").each(function(){
			var unescapedTerm = $(this).text();
			var escapedTerm = escape($(this).text());
			thisGlossaryEntryTermArray.push(unescapedTerm);
		});
		
		var thisGlossaryEntryTitle = $thisGlossaryEntry.find("title").text();
		
		var thisGlossaryEntryDefinition = $thisGlossaryEntry.find("definition").text();
		
		var thisGlossaryEntryCredits = $thisGlossaryEntry.find("glossarycredit").text();
		
		var thisGlossaryEntryObject = new GlossaryEntryObject(thisGlossaryEntryNumber, thisGlossaryEntryImageCode, thisGlossaryEntryImageObject, thisGlossaryEntryTitle, thisGlossaryEntryTermArray, thisGlossaryEntryDefinition, thisGlossaryEntryCredits);
		
		glossaryArray.push(thisGlossaryEntryObject);
		
	});
	
	$xml.find('person').each(function(){
		var $thisAuthor = $(this);
		var thisAuthorNumber = $thisAuthor.attr("number");
		// console.log("---=== thisAuthorNumber :: " + thisAuthorNumber);
		var thisAuthorImageCode = $thisAuthor.find("imageCode").text();
		var thisAuthorImageObject;
		
		$xml.find('image').each(function(){
			var $thisImage = $(this);
			var thisImageNumber = $thisImage.attr("number");
			var thisImageCode = $thisImage.find("imageCode").text();
			
			if(thisImageCode == thisAuthorImageCode){
				var thisImageThumbFileName = $thisImage.find("thumbFileName").text();
				var thisImageLargeFileName = $thisImage.find("largeFileName").text();
				var thisImageCredit = $thisImage.find("credit").text();
				var thisImageApproved = $thisImage.find("approved").text();
				thisAuthorImageObject = new ImageObject(thisImageNumber, thisImageCode, thisImageThumbFileName, thisImageLargeFileName, thisImageCredit, thisImageApproved);
			}else{
				//return false;
			}
		});
		
		/*
		var thisGlossaryEntryTerms = $thisGlossaryEntry.find("terms");
		var thisGlossaryEntryTermArray = [];
		$thisGlossaryEntry.find("term").each(function(){
			var unescapedTerm = $(this).text();
			var escapedTerm = escape($(this).text());
			thisGlossaryEntryTermArray.push(unescapedTerm);
		});
		*/
		
		var thisAuthorName = $thisAuthor.find("authorName").text();
		//var thisAuthorNameEscaped = escape($thisAuthor.find("authorName").text());
		
		var thisAuthorFullName = $thisAuthor.find("authorFullName").text();
		var thisAuthorBio = $thisAuthor.find("authorBio").text();
		var thisAuthorDesc = $thisAuthor.find("authorDesc").text();
		var thisAuthorCredits = $thisAuthor.find("authorCredit").text();
		
		var thisAuthorObject = new AuthorObject(thisAuthorNumber, thisAuthorImageCode, thisAuthorImageObject, thisAuthorName, thisAuthorBio, thisAuthorDesc, thisAuthorFullName, thisAuthorCredits);
		
		authorArray.push(thisAuthorObject);
	
	});
	
	
	
	
	
	
	
	
	
	// Set the values for the image URL paths
	$uiImagePathFromXml = $xml.find("uiImagePath").text();
	uiImagePath = $uiImagePathFromXml;
	$thumbImagePathFromXml = $xml.find("thumbImagePath").text();
	thumbImagePath = $thumbImagePathFromXml;
	$largeImagePathFromXml = $xml.find("largeImagePath").text();
	largeImagePath = $largeImagePathFromXml;
	
	$("#debugQuoteListHeading").html("There are " + quoteArray.length + " quote(s) in the XML document.");
	
	$("#debugQuoteList").html(stringForDebugQuoteList);
	
	$(".debugQuoteLi").click(function(){
		updateDebugQuoteChecker($(this).attr("quoteArrayIndex"));
	});
	
	$(".mainMenuButton").click(function(){
		resetInactivityTimer();
		clickedMenuButton($(this).text());
	});
	
	addGlossaryLinkTagsToQuoteBodyText();
	addAuthorLinkTagsToQuoteBodyText();
	
	//	Attract screen
	$('#attractScreen .attractorHeadline').text($xml.find('attractMessageSubhead').text());
	$('#attractScreen .attractorBodyText').text($xml.find('attractMessageBody').text());
	$('#attractorVid').get(0).play();

	if(!debugMode) {
		$('#debugWrapper').remove();
	}

}

var QuoteObject = function(quoteNumber, quoteImageCode, quoteImageObject, quoteBody, quoteBodyLen, quoteAuthor, quoteDate, quoteObjectName, quotePageNumber, quoteAccessionNumber, quoteCategory, quoteImageDescription){
	this.myQuoteObjectNumber = quoteNumber;
	this.myQuoteObjectImageCode = quoteImageCode;
	this.myQuoteObjectImageObject = quoteImageObject;
	this.myQuoteObjectBody = quoteBody;
	this.myQuoteObjectBodylength = quoteBodyLen;
	this.myQuoteObjectAuthor = quoteAuthor;
	this.myQuoteObjectImageDescription = quoteImageDescription;
	this.myQuoteObjectDate = quoteDate;
	this.myQuoteObjectObjectName = quoteObjectName;
	this.myQuoteObjectPageNumber = quotePageNumber;
	this.myQuoteObjectAccessionNumber = quoteAccessionNumber;
	this.myQuoteObjectCategory = quoteCategory;
	
}

var GlossaryEntryObject = function(glossaryEntryNumber, glossaryEntryImageCode, glossaryEntryImageObject, glossaryEntryTitle, glossaryEntryTermArray, glossaryEntryDefinition, glossaryEntryCredits){
	this.myGlossaryObjectEntryObjectNumber = glossaryEntryNumber;
	this.myGlossaryObjectEntryImageCode = glossaryEntryImageCode;
	this.myglossaryObjectEntryImageObject = glossaryEntryImageObject;
	this.myglossaryObjectEntryTitle = glossaryEntryTitle;
	this.myGlossaryObjectEntryTermArray = glossaryEntryTermArray;
	this.myGlossaryObjectEntryDefinition = glossaryEntryDefinition;
	this.myGlossaryObjectEntryCredits = glossaryEntryCredits;
	// console.log('Glossary created with "' + this.myGlossaryObjectEntryTermArray + '" as the thisGlossaryEntryTermArray!');
}

var AuthorObject = function(authorNumber, authorImageCode, authorImageObject, authorName, authorBio, authorDesc, authorFullName, authorCredits){
	this.myAuthorObjectNumber = authorNumber;
	this.myAuthorImageCode = authorImageCode;
	this.myAuthorImageObject = authorImageObject;
	this.myAuthorObjectName = authorName;
	this.myAuthorObjectFullName = authorFullName;
	this.myAuthorObjectBio = authorBio;
	this.myAuthorObjectDesc = authorDesc;
	this.myAuthorObjectCredits = authorCredits;
	// console.log('Author "' + this.myAuthorObjectName + '" created.');
}

var ImageObject = function(imageNumber, imageCode, imageThumbFileName, imageLargeFileName, imageCredit, imageApproved, imageLayout){
	this.myImageObjectNumber = imageNumber;
	this.myImageObjectCode = imageCode;
	this.myImageObjectThumbFileName = imageThumbFileName;
	this.myImageObjectLargeFileName = imageLargeFileName;
	this.myImageObjectCredit = imageCredit;
	this.myImageObjectApproved = imageApproved;
	this.myImageObjectLayout = imageLayout;
}


$.expr[":"].ignorecasecontains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});


function addGlossaryLinkTagsToQuoteBodyText(){
	
	for(var i = 0; i < quoteArray.length; i++){
		
		
		var thisQuoteBodyText = quoteArray[i].myQuoteObjectBody;
		
		$("#debugGlossaryTempHolder").html(thisQuoteBodyText);
		
		for(var j = 0; j < glossaryArray.length; j++){
			
			var thisGlossaryArrayEntryTerms = glossaryArray[j].myGlossaryObjectEntryTermArray;
			
			for(var k = 0; k < thisGlossaryArrayEntryTerms.length; k++){
				
				var theGlossaryTerm = glossaryArray[j].myGlossaryObjectEntryTermArray[k];
				
				// console.log("Glossary term :: " + theGlossaryTerm);
				
				$("#debugGlossaryTempHolder:ignorecasecontains('" + theGlossaryTerm + "')").html(function(_, html) {
					var re = new RegExp(theGlossaryTerm,"ig");
					return html.replace(re, function returnOriginalTextValue(x){return '<span class="glossaryTermLink" glossaryArrayIndex="' + j + '">' + x + '</span>'});
				});
				
			}
		}
		
		var theNewBody = $("#debugGlossaryTempHolder").html();
		quoteArray[i].myQuoteObjectBody = theNewBody;
		
	}
	
}















function addAuthorLinkTagsToQuoteBodyText(){
	
	for(var i = 0; i < quoteArray.length; i++){
		
		
		var thisQuoteAuthorName = quoteArray[i].myQuoteObjectAuthor;
		
		$("#debugGlossaryTempHolder").html(thisQuoteAuthorName);
		
		for(var j = 0; j < authorArray.length; j++){
			
			var thisAuthorName = authorArray[j].myAuthorObjectName;
			
			// console.log("Author name :: " + thisAuthorName);
			
			$("#debugGlossaryTempHolder:ignorecasecontains('" + thisAuthorName + "')").html(function(_, html) {
				var re = new RegExp(thisAuthorName,"ig");
				return html.replace(re, function returnOriginalTextValue(x){return '<span class="authorLink" authorArrayIndex="' + j + '">' + x + '</span>'});
			});
			
			/*
			for(var k = 0; k < thisGlossaryArrayEntryTerms.length; k++){
				
				var theGlossaryTerm = glossaryArray[j].myGlossaryObjectEntryTermArray[k];
				
				console.log("Glossary term :: " + theGlossaryTerm);
				
				$("#debugGlossaryTempHolder:ignorecasecontains('" + theGlossaryTerm + "')").html(function(_, html) {
					var re = new RegExp(theGlossaryTerm,"ig");
					return html.replace(re, function returnOriginalTextValue(x){return '<span class="glossaryTermLink" glossaryArrayIndex="' + j + '">' + x + '</span>'});
				});
				
			}
			*/
		}
		
		var theNewName = $("#debugGlossaryTempHolder").html();
		quoteArray[i].myQuoteObjectAuthor = theNewName;
		
	}
	
}












function clickedMenuButton(clickedMenuButtonText){
	
	activeCategoryQuoteIndexes = [];
	
	var categoryQuoteCount = 0;
	
	for(var i = 0; i < quoteArray.length; i++){
		var thisQuoteCategory = quoteArray[i].myQuoteObjectCategory;
		
		if(thisQuoteCategory == clickedMenuButtonText){
			categoryQuoteCount++;
			console.log("There are " + categoryQuoteCount + " quotes in the category \"" + clickedMenuButtonText + "\"");

			activeCategoryQuoteIndexes.push(i);
		}
		
				if (categoryQuoteCount ==1 ){
			console.log("Only one quote" );
			$("#quoteScreenRightButton").addClass("hideimportant");
		}
		else {
			console.log("more than one quotes" )
			$("#quoteScreenRightButton").removeClass("hideimportant");
		}

		
	}
	
	// console.log(activeCategoryQuoteIndexes);
	
	addPaginationMarkersToQuoteScreen();
	updateQuoteScreenContent(0);
	
}

function showQuoteScreenDiv(){
	$("#quoteScreen").addClass("showquote");
	// $("#quoteScreen").css("display", "block");
	$("#mainMenuScreen").addClass("removemainmanu");
}

function hideQuoteScreenDiv(){
	$("#quoteScreen").removeClass("showquote");
	$("#mainMenuScreen").removeClass("removemainmanu");

}

function addPaginationMarkersToQuoteScreen(){
	
	var paginationMarkersHtml = "";
	
	for(var i = 0; i < activeCategoryQuoteIndexes.length; i++){
		if(i == 0){
			paginationMarkersHtml += '<li class="activequote"></li>';
		}else{
			paginationMarkersHtml += '<li></li>';
		}
	}
	
	$("#pagination").html(paginationMarkersHtml);
}

function updatePaginationClass(activeQuoteArrayIndex){
	
	var i=0;
	$("#pagination li").each(function(){
		if(i == activeQuoteArrayIndex){
			$(this).attr("class","activequote");
			//paginationMarkersHtml += '<li class="activequote"></li>';
		}else{
			$(this).attr("class","");
			//paginationMarkersHtml += '<li></li>';
		}
		i++;
	});
	
	//activeQuoteArrayIndex
	
}

function updateQuoteScreenContent(activeQuoteArrayIndex){
	
	clearQuoteScreenContent();
	
	updatePaginationClass(activeQuoteArrayIndex);
	
	
	var thisQuoteIndex = activeCategoryQuoteIndexes[activeQuoteArrayIndex];
	
	thisQuote = quoteArray[thisQuoteIndex];

	if(thisQuote.myQuoteObjectImageObject.myImageObjectLayout === 1) {
		$('#quoteScreen').removeClass('layout0');
		$('#quoteScreen').addClass('layout1');
		console.log("Layout 1");
	} else {
		$('#quoteScreen').removeClass('layout1');
		$('#quoteScreen').addClass('layout0');
		console.log("Layout 0");
	}
	
	
	if(thisQuote.myQuoteObjectImageObject.myImageObjectLayout === 2) {
		$('#quoteScreen').removeClass('layout0');
		$('#quoteScreen').addClass('layout2');
		console.log("Layout 2");
	} else {
		$('#quoteScreen').removeClass('layout2');
		$('#quoteScreen').addClass('layout0');
		console.log("Layout 0");
	}
	
		if(thisQuote.myQuoteObjectImageObject.myImageObjectLayout === 3) {
		$('#quoteScreen').removeClass('layout0');
		$('#quoteScreen').addClass('layout3');
		console.log("Layout 3");
	} else {
		$('#quoteScreen').removeClass('layout3');
		$('#quoteScreen').addClass('layout0');
		console.log("Layout 0");
	}

			if(thisQuote.myQuoteObjectImageObject.myImageObjectLayout === 4) {
		$('#quoteScreen').removeClass('layout0');
		$('#quoteScreen').addClass('layout4');
		console.log("Layout 4");
	} else {
		$('#quoteScreen').removeClass('layout4');
		$('#quoteScreen').addClass('layout0');
		console.log("Layout 0");
	}


	updateQuoteNavButtons(activeQuoteArrayIndex);
	
	$("#quoteContent").attr("quoteNumber", activeQuoteArrayIndex);
	
	$("#quoteImage").attr("src", "img/l/"+thisQuote.myQuoteObjectImageObject.myImageObjectLargeFileName);
	
	var len = thisQuote.myQuoteObjectBodylength;
    
	if(len > 400){
        $("#quoteBodyTextHolder").addClass("size-small");
    }
    else {
       $("#quoteBodyTextHolder").removeClass("size-small");
    }
	
	if(len > 300){
        $(".layout1 #quoteBodyTextHolder").addClass("size-small");
    }
    else {
       $(".layout1 #quoteBodyTextHolder").removeClass("size-small");
    }
	
	if(len > 500){
        $(".layout1 #quoteBodyTextHolder").addClass("smaller");
    }
    else {
       $(".layout1 #quoteBodyTextHolder").removeClass("smaller");
    }
	
	$("#quoteBodyTextHolder").html(thisQuote.myQuoteObjectBody);
	$("#quoteObjectNameTextHolder").html(thisQuote.myQuoteObjectObjectName);
	$("#quotePageNumberTextHolder").html(thisQuote.myQuoteObjectPageNumber);
	$("#quoteAccessionNumberTextHolder").html(thisQuote.myQuoteObjectAccessionNumber);
	$("#quoteAuthorTextHolder").html(thisQuote.myQuoteObjectAuthor);
	$("#imageDescription").html(thisQuote.myQuoteObjectImageDescription);
	$("#quoteDateTextHolder").html(thisQuote.myQuoteObjectDate);
	$("#quoteCategory span").html(thisQuote.myQuoteObjectCategory);
	
	$(".glossaryTermLink").click(function(){
		clickedGlossaryTermSpan($(this).attr("glossaryArrayIndex"));
	});
	$(".authorLink").click(function(){
		resetInactivityTimer();
		//clickedGlossaryTermSpan($(this).attr("glossaryArrayIndex"));
		clickedAuthorSpan($(this).attr("authorArrayIndex"));
	});
	
	showQuoteScreenDiv();
	
}

function updateQuoteNavButtons(passedQuoteArrayIndex){
	console.log("activeCategoryQuoteIndexes.length :: " + activeCategoryQuoteIndexes.length);
	console.log(activeCategoryQuoteIndexes);
	if(activeCategoryQuoteIndexes.length < 2) {
		$(".prevQuoteTextWrapper").css("display", "none");
		$("#quoteScreenLeftButton").css("display", "none");
		$("#quoteScreenRightButton").css("display", "none");
		$(".nextQuoteTextWrapper").css("display", "none");
	} else if(passedQuoteArrayIndex == 0){
		$(".prevQuoteTextWrapper").css("display", "none");
		$("#quoteScreenLeftButton").css("display", "block");
		$("#quoteScreenRightButton").css("display", "block");
		$(".nextQuoteTextWrapper").css("display", "block");
	}else if(passedQuoteArrayIndex == (activeCategoryQuoteIndexes.length-1)){
		$(".prevQuoteTextWrapper").css("display", "block");
		$("#quoteScreenLeftButton").css("display", "block");
		$("#quoteScreenRightButton").css("display", "block");
		$(".nextQuoteTextWrapper").css("display", "none");
	}else{
		$(".prevQuoteTextWrapper").css("display", "block");
		$("#quoteScreenLeftButton").css("display", "block");
		$("#quoteScreenRightButton").css("display", "block");
		$(".nextQuoteTextWrapper").css("display", "block");
	}
	
}

function clearQuoteScreenContent(){
	
	$("#quoteContent").attr("quoteNumber", "0");
	$("#quoteImage").attr("src", "");
	$("#quoteBodyTextHolder").html("");
	$("#quoteObjectNameTextHolder").html("");
	$("#quotePageNumberTextHolder").html("");
	$("#quoteAccessionNumberTextHolder").html("");
	$("#quoteAuthorTextHolder").html("");
	$("#imageDescription").html("");
	
}


///////////////////////////////////
/////	++ GLOSSARY SCREEN FUNCTIONS ++

function showGlossaryScreenDiv(){
	$("#glossaryScreen").css("left", "0");
	// $("#glossaryScreen").css("display", "block");
	$("#glossaryScreen").addClass("glossaryactive");
	$("#quoteScreen").addClass("blurred");
}

function hideGlossaryScreenDiv(){
	$("#glossaryScreen").css("left", "1920px");
	// $("#glossaryScreen").css("display", "none");
	$("#glossaryScreen").removeClass("glossaryactive");
	$("#quoteScreen").removeClass("blurred");
}

function clickedGlossaryTermSpan(glossaryArrayIndex){
	console.log("glossaryArrayIndex :: " + glossaryArrayIndex);
	
	updateGlossaryScreenContent(glossaryArrayIndex);
}

function updateGlossaryScreenContent(glossaryArrayIndex){
	clearGlossaryScreenContent();
	
	thisGlossaryTerm = glossaryArray[glossaryArrayIndex];
	
	$("#glossaryContent").attr("glossaryTermNumber", glossaryArrayIndex);
	
	$("#glossaryImage").attr("src", "img/l/"+thisGlossaryTerm.myglossaryObjectEntryImageObject.myImageObjectLargeFileName);
	
	$("#glossaryCredits").html(thisGlossaryTerm.myGlossaryObjectEntryCredits);
	
	$("#glossaryScreenTermTextHolder").html(thisGlossaryTerm.myglossaryObjectEntryTitle);
	$("#glossaryScreenDefinitionTextHolder").html(thisGlossaryTerm.myGlossaryObjectEntryDefinition);
	
	showGlossaryScreenDiv();
}

function clearGlossaryScreenContent(){
	$("#glossaryContent").attr("glossaryTermNumber", "0");
	$("#glossaryImage").attr("src", "");
	$("#glossaryCredits").html("");
	$("#glossaryScreenTermTextHolder").html("");
	$("#glossaryScreenDefinitionTextHolder").html("");
}

/////	-- GLOSSARY SCREEN FUNCTIONS --
///////////////////////////////////


///////////////////////////////////
/////	++ AUTHOR SCREEN FUNCTIONS ++

function showAuthorScreenDiv(){
	$("#authorScreen").css("left", "0");
	// $("#authorScreen").css("display", "block");
	$("#authorScreen").addClass("authoractive");
	$("#quoteScreen").addClass("blurred");
}

function hideAuthorScreenDiv(){
	$("#authorScreen").css("left", "1920px");
	// $("#authorScreen").css("display", "none");
	$("#authorScreen").removeClass("authoractive");
	$("#quoteScreen").removeClass("blurred");
}

function clickedAuthorSpan(authorArrayIndex){
	console.log("authorArrayIndex :: " + authorArrayIndex);
	updateAuthorScreenContent(authorArrayIndex);
}

function updateAuthorScreenContent(authorArrayIndex){
	clearAuthorScreenContent();
	
	thisAuthor = authorArray[authorArrayIndex];
	
	$("#authorContent").attr("authorNumber", authorArrayIndex);
	
	$("#authorImage").attr("src", "img/l/"+thisAuthor.myAuthorImageObject.myImageObjectLargeFileName);
	
	$("#authorScreenNameTextHolder").html(thisAuthor.myAuthorObjectFullName);
	$("#authorScreenBioTextHolder").html(thisAuthor.myAuthorObjectBio);
	$("#authorScreenDescTextHolder").html(thisAuthor.myAuthorObjectDesc);
	$("#authorCredits").html(thisAuthor.myAuthorObjectCredits);
	
	showAuthorScreenDiv();
}

function clearAuthorScreenContent(){
	$("#authorContent").attr("authorNumber", "0");
	$("#authorImage").attr("src", "");
	$("#authorScreenNameTextHolder").html("");
	$("#authorScreenBioTextHolder").html("");
	$("#authorScreenDescTextHolder").html("");
	$("#authorCredits").html("");
}

/////	-- AUTHOR SCREEN FUNCTIONS --
///////////////////////////////////




///////////////////////////////////
/////	++ STILL THERE SCREEN FUNCTIONS ++

function showStillThereScreen() {
	startStillThereCountdown();
	$('#stillThereScreen').show();
}

function startStillThereCountdown() {
	stillThereCountdown = stillThereCountdownMax;
	$('#stillThereSpanS').text('s');
	$('#stillThereSpan').text(stillThereCountdown);
	stillThereCountdownHandler = setInterval(function() {
		stillThereCountdown--;
		$('#stillThereSpan').text(stillThereCountdown);
		if(stillThereCountdown === 0) {
			$('#stillThereSpanS').text('s');
			stillThereTimeout();
		} else if(stillThereCountdown === 1) {
			$('#stillThereSpanS').text('');
		} else {
			$('#stillThereSpanS').text('s');
		}
	}, 1000);
}

function stillThereTimeout() {
	clearStillThereCountdown();
	startAttract();
}

function clearStillThereCountdown() {
	clearTimeout(stillThereCountdownHandler);
	stillThereCountdownHandler = null;
}

$('#stillThereScreen').click(function() {
	clearStillThereCountdown();
	$('#stillThereScreen').fadeOut('fast', function() {
		startInactivityTimer();
	});	
});

///////////////////////////////////
/////	++ ATTRACT SCREEN FUNCTIONS ++

function toggleAttractScreenViz(){
	$("#attractScreen").toggle();
}

function startAttract(){
	$('#stillThereScreen').fadeOut('fast');
	attractModeActive = true;
	$("#quoteScreenCloseButton").click();
	$("#glossaryScreenCloseButton").click();
	$("#authorScreenCloseButton").click();
	$("#attractScreen").fadeIn("fast");
	stopInactivityTimer();
}

function endAttract(){
	attractModeActive = false;
	startInactivityTimer();
	$("#attractScreen").fadeOut("slow");
}

function loopAttractFade(){
	$('#attractMessageWrapper').fadeIn(1500, function(){
		$('#attractMessageWrapper').delay(10000).fadeOut(1500, function(){
			//alert($('#attractMessageWrapper').css("border-color"));
			if($('#attractMessageWrapper').css("border-color") == "rgb(255, 255, 255)"){
				$('#attractMessageWrapper').css({"border-color": "rgb(0,0,0)", "background-color": "#dddddd"});
				$('#attractMessageSubheadH1').css({"color": "rgb(104,104,104)"});
				$('#attractMessageHeadH3, #attractMessageBodyP').css({"color": "rgb(0,0,0)"});
			}else{
				$('#attractMessageWrapper').css({"border-color": "rgb(255,255,255)", "background-color": "rgb(0,0,0)"});
				$('#attractMessageSubheadH1').css({"color": "rgb(208,208,208)"});
				$('#attractMessageHeadH3, #attractMessageBodyP').css({"color": "rgb(255,255,255)"});
			}
			loopAttractFade();
		});
	});
}



// ANIMATIONS 

		$("#quoteScreenRightButton, #quoteScreenLeftButton, .mainMenuButton").click(function(){
			$('#quoteImageHolder').css('transform', 'translateX(20px)');
			$('#quoteImageHolder').removeClass('showimage');
			setTimeout(function() {
				$('#quoteImageHolder').addClass('showimage');
			},30);
			
			});


					
		$("#quoteScreenRightButton, .mainMenuButton").click(function(){
			$('#quoteTextWrapper').css('transform', 'translateX(20px)');
			$('#quoteImageHolder').css('transform', 'translateX(20px)');
			$('#quoteTextWrapper').removeClass('showquotewrapper');
			setTimeout(function() {
				$('#quoteTextWrapper').addClass('showquotewrapper');
			},30);
				});

		$("#quoteScreenLeftButton").click(function(){
			$('#quoteTextWrapper').css('transform', 'translateX(-20px)');
			$('#quoteImageHolder').css('transform', 'translateX(-20px)');
			$('#quoteTextWrapper').removeClass('showquotewrapper');
				setTimeout(function() {
				$('#quoteTextWrapper').addClass('showquotewrapper');
			},30);
				});

	



/////	-- ATTRACT SCREEN FUNCTIONS --
///////////////////////////////////


///////////////////////////////////
/////	++ CHECK FONT SIZE

/*
var videoInterval = setInterval(function() {
    var len = $("#quoteBodyTextHolder").text().length;    
    if(len > 400){
        $("#quoteBodyTextHolder").addClass("size-small");
    }
    else {
       $("#quoteBodyTextHolder").removeClass("size-small");
    }
}, 100);
*/

///////////////////////////////////
/////	++ ADD LISTENER FUNCTIONS ++

function addUIListeners(){
	$("#attractScreen").click(function(){
		// Debug screen
		endAttract();
	});
	
	$("#quoteScreenLeftButton").click(function(){
		resetInactivityTimer();
		var theCurrentQuoteNumber = parseInt($("#quoteContent").attr("quotenumber"));
		var desiredQuoteNumber = theCurrentQuoteNumber-1;
		if(desiredQuoteNumber < 0) {
			desiredQuoteNumber = activeCategoryQuoteIndexes.length -1;
		}
		updateQuoteScreenContent(desiredQuoteNumber);
	});
	
	$("#quoteScreenRightButton").click(function(){
		resetInactivityTimer();
		var theCurrentQuoteNumber = parseInt($("#quoteContent").attr("quotenumber"));
		var desiredQuoteNumber = theCurrentQuoteNumber+1;
		if(desiredQuoteNumber >= activeCategoryQuoteIndexes.length) {
			desiredQuoteNumber = 0;
		}
		updateQuoteScreenContent(desiredQuoteNumber);
	});
	
	$("#quoteScreenCloseButton").click(function(){
		resetInactivityTimer();
		hideQuoteScreenDiv();
	});
	
	$("#glossaryScreenCloseButton").click(function(){
		resetInactivityTimer();
		hideGlossaryScreenDiv();
	});
	
	$("#authorScreenCloseButton").click(function(){
		resetInactivityTimer();
		hideAuthorScreenDiv();
	});
	
	

   $( "#quoteTextWrapper" ).on( "swiperight", SwipeRight );
	
   $( "#quoteTextWrapper" ).on( "swipeleft", SwipeLeft );		
	
	function SwipeRight(){
		console.log("SwipedRight");
		var theCurrentQuoteNumber = parseInt($("#quoteContent").attr("quotenumber"));
		if(theCurrentQuoteNumber == 0){

			// Do nothing as this is the first entry and we should not be able to swipe right

		}else{

			var desiredQuoteNumber = theCurrentQuoteNumber-1;
			updateQuoteScreenContent(desiredQuoteNumber);
			$('#quoteTextWrapper').css('transform', 'translateX(-20px)');
			$('#quoteImageHolder').css('transform', 'translateX(-20px)');
			$('#quoteTextWrapper').removeClass('showquotewrapper');
			setTimeout(function() {
				$('#quoteTextWrapper').addClass('showquotewrapper');
			},30);

		}

	};


	function SwipeLeft(){
		console.log("SwipedLeft");

		var theCurrentQuoteNumber = parseInt($("#quoteContent").attr("quotenumber"));
		var activeQuoteArrayLength = activeCategoryQuoteIndexes.length-1;
		if(theCurrentQuoteNumber == activeQuoteArrayLength){

			// Do nothing as this is the last entry and we should not be able to swipe left

		}else{

			var desiredQuoteNumber = theCurrentQuoteNumber+1;
			updateQuoteScreenContent(desiredQuoteNumber);
			$('#quoteTextWrapper').css('transform', 'translateX(20px)');
			$('#quoteImageHolder').css('transform', 'translateX(20px)');
			$('#quoteTextWrapper').removeClass('showquotewrapper');
			setTimeout(function() {
				$('#quoteTextWrapper').addClass('showquotewrapper');
			},30);

		}

	};
		
}

/////	-- ADD LISTENER FUNCTIONS --
///////////////////////////////////

///////////////////////////////////
/////	++ TIMING FUNCTIONS ++

function startInactivityTimer(){
	console.log("startInactivityTimer()");
	clearTimeout(inactivityTimer);
	inactivityTimer = setTimeout(showStillThereScreen, inactivityTimerMax);
}

function stopInactivityTimer(){
	console.log("stopInactivityTimer()");
    clearTimeout(inactivityTimer);
}

function resetInactivityTimer(){
	console.log("resetInactivityTimer()---");
	stopInactivityTimer();
	startInactivityTimer();
	console.log("resetInactivityTimer()---");
}

/////	-- TIMING FUNCTIONS --
///////////////////////////////////