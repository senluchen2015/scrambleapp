angular.module('scrambleApp',[])
	.controller('scrambleController', ['$scope', '$http','$timeout','$interval',
		function ($scope, $http, $timeout, $interval) {
		var unenteredWord = []
		var enteredWord = []
		var correctWord = ""

		$scope.init = function(){
			$scope.points = 0
			$scope.multiplier = 1
			$scope.timeLeft = 60
			$scope.isFinished = false
			startTimer()
			getWord()
		}

		//function get a new word
		getWord = function(){
			$http.get('http://api.wordnik.com:80/v4/words.json/'+
				'randomWord?hasDictionaryDef=true&includePartOfSpeech='+
				'noun,adjective,verb,adverb&'+
				'minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1'+
				'&maxDictionaryCount=-1&minLength=5&maxLength=6&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').
			success(function(data, status){
				correctWord = data.word.toUpperCase()
				// console.log(correctWord)
				
				if(!checkWordValid(correctWord)){
					getWord()
					return
				}
				unenteredWord = shuffle(data.word)
				enteredWord = []
				presentWord()
				$scope.wordCorrect = false
			}).
			error(function(data,status){
				console.log(data);
			})
		}

		checkWordValid = function(word){
			//accept only capital letter A-Z
			for(i in word){
				if(word.charCodeAt(i) < 64 || word.charCodeAt(i) > 91){
					return false
				} 
			}
			return true
		}

		shuffle = function(word){
			var shuffledWord = []
			length = word.length
			for(var i = 0; word.length; i++){
				var index = Math.floor(Math.random() * word.length)
				var newChar = word.charAt(index).toUpperCase()
				shuffledWord.push({key:newChar, value:{"idx":shuffledWord.length,"entered":false}})
				word = 	word.substr(0,index) + word.substr(index+1)	
			}
			return shuffledWord
		}

		presentWord = function(){
			$scope.word = enteredWord.concat(unenteredWord)
		} 

		//track when any key is entered
		$scope.keyEntered = function(event){
			if(!$scope.isFinished){
				var spacebar = 32
				var backspace = 8 
				var lowerBound = 64
				var upperBound = 91

				if(event.which == spacebar){
					$scope.multiplier = 1;
					getWord()
				}
				else if(event.which == backspace){
					handleDelete()
				}
				else if(event.which > lowerBound && event.which < upperBound){
					var charEntered = String.fromCharCode(event.which).toUpperCase()
					newCharEntered(charEntered)
					checkIfCorrect()
				}
				presentWord()
			}
		}

		$scope.preventBack = function(){
			var backspace = 8 
			if(event.which == backspace){
				event.preventDefault()
			}
		}

		//remove last character in enteredWord and put i back in unenteredWord
		handleDelete = function(){
			if(enteredWord.length > 0){
				var character = enteredWord[enteredWord.length-1]
				var index = character.value.idx
				character.value.entered = false
				enteredWord.pop()
				unenteredWord.splice(index,0,character)
			}
		}

		//find character in unenteredWord and move it into entered word
		newCharEntered = function(charEntered){
			for(i in unenteredWord){
				character = unenteredWord[i]
				if(character.key == charEntered){
					unenteredWord.splice(i,1)
					character.value.entered = true
					character.value.idx = i
					enteredWord.push(character)
					break
				}
			}
		}

		checkIfCorrect = function(){
			if(unenteredWord.length == 0){
				word = ""
				for(i in enteredWord){
					word += enteredWord[i].key
				}
				if(word == correctWord){
					//points = word length * multiplier
					$scope.points += word.length * $scope.multiplier
					//max multiplier = 8 
					if($scope.multiplier < 8){
						$scope.multiplier += 1
					}
					$scope.wordCorrect = true
					$timeout(function(){
						getWord()
					},500,true,[])
				}
				else{
					$scope.wordIncorrect = true
					$timeout(function(){
						while(enteredWord.length > 0){
							handleDelete()
						}
						$scope.wordIncorrect = false
					},500,true,[])
				}
			}
		}

		startTimer = function(){
			$scope.timeLeft = 60
			$interval(function(){
				$scope.timeLeft -= 1
			},1000,60,true,[]).then(function(){
				$scope.isFinished = true
			})
		}

}])


