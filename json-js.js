
//解析成 json

var stringify = function (argument) {
	var result = '{';
	if (argument instanceof Object) {
		
		for (let attr in argument) {
			result += '"' + attr + '":';

			if (argument[attr] instanceof Object) {

				if (argument[attr] instanceof Array) {

					let tempArray = "["
					argument[attr].forEach(function(element) {

						//防止循环引用
						if (argument === element) {
							throw "Converting circular structure to JSON"
						}

						if (element instanceof Object) {
							tempArray += stringify(element)
						} else {
							tempArray += element
						}
						tempArray += ","
					})

					tempArray = tempArray.substring(0, tempArray.length - 1)
					tempArray += "]"
					result += tempArray

				} else {

					if (argument === argument[attr]) {
						throw "Converting circular structure to JSON"
					}
					result += stringify(argument[attr])
				}
			} else {
				result += argument[attr];
			}

			result += ","
		}

		//去掉最后一个 逗号
		result = result.substring(0, result.length - 1)
		result += "}"
		return result
	} else {
		throw "must be an object"
	}
}



// 生成json对象



/*
算法思想:  把复杂的json简单话

最简单的形式:  {"aa": 11, "bb": 22}

混杂形式  {"aa": 11, "bb": {"aa": 11}, "cc":[11,22,{"aa":11}, 11]} 

混杂形式有 对象 数组

流程为   混杂形式----转变成 {"aa": 11, "bb": token1, "cc": token2} 
		 --->token1, token2记录在map中 map[token1] = '{"aa":11}' map[token2] = [11,22,{"aa":11}, 11]

         把 {"aa": 11, "bb": token1, "cc":token2} 利用parseSimpleJson 转成对象

         在依次遍历 这个对象里面的属性， 如果map[attr] 存在的话，
         如果 map[token/attr]为对象形式的字符串 就直接递归 parse
         如果 map[token/attr]为数组 就预处理数组字符串，数组字符变成 [11, 22, token3, 11]的数组对象
         然后再把 token3 变成 parse(token3)即可
*/





function findSymmetricSymbol(targetString, startIndex, leftSymbol, rightSymbol) {

	if (targetString.charAt(startIndex) !== leftSymbol) {
		throw 'argument error'
	}

	var stack = [] // 这个栈是用来 寻找 左符号的  对应的 右符号 不断入栈 出栈
	for (var i = startIndex; i < targetString.length; i++) {

		if (targetString[i] === leftSymbol)
			stack.push(leftSymbol)
		else if (targetString[i] === rightSymbol) {
			stack.pop()
			if (stack.length === 0) {
				return i
			}
		}
	}	
	return -1
}


// console.log('{{aaaaa{{aaaaa{{{aaa}}aa}}aa}}a}'.length)
// console.log(findSymmetricSymbol("{{aaaaa{{aaaaa{{{aaa}}aa}}aa}}a}", 7, '{', '}'))


function parseSimpleJson(argument) {
	
	var result = {}
	argument = argument.trim()
	argument = argument.substring(1, argument.length - 1) //去掉{ }

	var allKeyValueArray = argument.split(',')
	allKeyValueArray.forEach(function (element) {
		singleKeyAndValue = element.split(':')
		result[singleKeyAndValue[0]] =singleKeyAndValue[1]
	})
	return result
}



/*
这个是对 数组进行预处理， 生成一个
带token的 数组对象
而且token 全放入 map中        引用map
idObj是为了全局的唯一id做准备 引用传入 idObj = {id: num, prefix:_*_, suffix:_*_}
*/


function preprocessJsonArray(arrayString, map, idObj) {

	var result = null
	arrayString = arrayString.substring(1, arrayString.length - 1) //去掉[ ]
	var currentIndex = 0
	while(currentIndex < arrayString.length) {
		if (arrayString[currentIndex] === '{') {
			var right = findSymmetricSymbol(arrayString, currentIndex, '{', '}')
				var subStr = arrayString.substring(currentIndex, right + 1)
				var uuid = idObj.prefix + (idObj.id++) + idObj.suffix
				map[uuid] = subStr
				arrayString = arrayString.substring(0, currentIndex) + uuid + arrayString.substring(right + 1)
				currentIndex += uuid.length
		} else {
			currentIndex++
		}
	}

	result = arrayString.split(',')
	return result
}

// preprocessJsonArray('["aa", "bb", {"aa":11}, "cc", {"dd":22}]', {}, {"id": 0, "prefix":"_*_", "suffix":"_*_"})

/**

对 json对象的预处理
argument 为 json对象字符串 {"aa":11...}
map 为全局的存储 对象
idObj 是为了生成 uuid的

*/
function preprocessJsonObject(argument, map, idObj) {

	var result = null
	var currentIndex = 1 //跨过第一个 {
	while(currentIndex < argument.length) {

		if (argument[currentIndex] === '{' || argument[currentIndex] === '[') {

			var leftSymbol = '{'
			var rightSymbol = '}'
			if (argument[currentIndex] === '[') {
				leftSymbol = '['
				rightSymbol = ']'
			} 

			var right = findSymmetricSymbol(argument, currentIndex, leftSymbol, rightSymbol)
			var subStr = argument.substring(currentIndex, right + 1)
			var uuid = idObj.prefix + (idObj.id++) + idObj.suffix
			map[uuid] = subStr
			argument = argument.substring(0, currentIndex) + uuid + argument.substring(right + 1)
			currentIndex += uuid.length
			
		} else {
			currentIndex++
		}
	}


	result = parseSimpleJson(argument)
	return result
}


// preprocessJsonObject('{"aa":11, "bb":22, "dd":{"aa":11}, tt:"cc", ff:{"dd":22}}', {}, {"id": 0, "prefix":"_*_", "suffix":"_*_"})



// 核心代码
var parse = function(argument) {

	//去掉所有的空格
	argument = argument.replace(/\s/g, "")
	map = {} //全局的map对象
	idObj = {"id": 0, "prefix":"_*_", "suffix":"_*_"}   //map 为了生成map全局id
	
	return function innerParse(argument) {

		var result = preprocessJsonObject(argument, map, idObj)

		// console.log(result)
		for (var key in result) {

			var mapKEY = result[key]

			//只能为 数组[] 或者 对象{}的情况
			if (map[mapKEY] != null) {
				
				//区别对象和数组的情况
				if (map[mapKEY].startsWith('{')) {

					result[key] = innerParse(map[mapKEY])
				} else {
				//处理数组的情况				
					tempArrayObj = preprocessJsonArray(map[mapKEY], map, idObj)
					for (var i = 0; i < tempArrayObj.length; i++) {
						if (map[tempArrayObj[i]] != null) {
							tempArrayObj[i] = innerParse(map[tempArrayObj[i]])
						}
					}
					result[key] = tempArrayObj
				}
			}
		}

		return result
	}(argument)
}


// var testJ = '{"aa":  11, "bb":{" aa":11, "bb":22, "cc": {"dd": 55}}, "gg":[{"aa":11, "bb":22}, "aa", {"cc":11}], "ff":{"dd": 66}}';
// console.log(parse(testJ))

var testObj = { "aa": 11, 
				"bb":["aa", {"aa":11}, 11, 33], 
				"cc":{"dd": 22, "ee":{"aa":11, "bb":22}},
				"dd": 11}

var jsonString = stringify(testObj)
console.log("stringify: ",jsonString)
console.log('-----------------------')
console.log('parse: ', parse(jsonString))


var startTime = new Date().getTime()
	for (var i = 0; i < 1000; i++) {
		var jsonString = JSON.stringify(testObj)
		JSON.parse(jsonString)
	}
var endTime = new Date().getTime()
console.log(endTime - startTime)


var startTime = new Date().getTime()
	for (var i = 0; i < 1000; i++) {
		var jsonString = stringify(testObj)
		parse(jsonString)
	}
var endTime = new Date().getTime()
console.log(endTime - startTime)



var circularReferenceTest = {"aa": 11}

circularReferenceTest.b = circularReferenceTest

console.log(stringify(circularReferenceTest))

// console.log(JSON.stringify(circularReferenceTest))
