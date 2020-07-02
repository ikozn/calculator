//1. 计算控制器
const CalController = (function () {
  let data = {
    curResult: 0, //当前结果
    operand: 0, //操作数
    curOperate: 'n', //当前操作
    equaled: false, //刚按过等于号
    formula: [0] //当前公式
  }
  //平方
  const sqr = function (num) {
    return num * num
  }
  //开方
  const sqrt = function (num) {
    return Math.sqrt(num)
  }
  //阶乘
  const fact = function (num) {
    let result = 1
    for (let i = 1; i <= num; i++) {
      result *= i
      if (result.toString().includes('Infinity')) {
        return result
      }
    }
    return result
  }
  //取反
  const negate = function (num) {
    return -num
  }

  return {
    //计算
    calculate: function () {
      let calStr = ''

      const formulaLen = data.formula.length
      const top = data.formula[formulaLen - 1]

      if ('+-×÷='.includes(top)) {
        calStr = data.formula.slice(0, formulaLen - 1)
      } else {
        calStr = data.formula
      }

      if (top === '=' && formulaLen === 2 && !'n='.includes(data.curOperate)) {
        calStr.push(data.curOperate)
        calStr.push(data.operand)
        this.pushOperate(data.curOperate)
        this.pushNumber(data.operand)
        this.pushOperate('=')
      }

      calStr = calStr
        .join('')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
      const result = eval(calStr)

      data.curResult = result
    },
    useFun: function (fun, num) {
      //1. 判断栈顶元素
      const topEl = data.formula[data.formula.length - 1]
      if ('+-×÷'.includes(topEl)) {
        //计算符号
        data.formula.push(`${fun}(${num})`)
      } else if (isNaN(topEl)) {
        //函数
        data.formula[data.formula.length - 1] = `${fun}(${topEl})`
      } else {
        //数字
        data.formula[data.formula.length - 1] = `${fun}(${num})`
      }
    },
    //推入操作符
    pushOperate: function (operate) {
      //如果已经有符号则替换，否则加入新符号
      if ('+-×÷='.includes(data.formula[data.formula.length - 1])) {
        data.formula[data.formula.length - 1] = operate
      } else {
        data.formula.push(operate)
      }

      //锁定操作符
      if (operate !== '=' && !data.equaled) data.curOperate = operate
    },
    //推入操作数
    pushNumber: function (number) {
      //溢出判断
      if (number.toString().includes('Infinity')) number = 0

      //如果最后一位是符号则推入栈顶，否则覆盖
      if ('+-×÷'.includes(data.formula[data.formula.length - 1])) {
        //符号
        data.formula.push(parseFloat(number))
      } else {
        data.formula[data.formula.length - 1] = number
      }

      if (!data.equaled) {
        data.operand = number
      }
    },
    //获取当前结果
    getCurResult: function () {
      return data.curResult
    },
    //获取操作数
    getOperand: function () {
      return data.operand
    },
    //获取当前式子
    getFormula: function () {
      return data.formula
    },
    //获取操作符
    getCurOperate: function () {
      return data.curOperate
    },
    //获取Data
    getData: function () {
      return data
    },
    //获取PI
    getPi: function () {
      this.pushNumber(Math.PI)
    },
    //获取计算状态
    getEqualed: function () {
      return data.equaled
    },
    //设置计算状态
    setEqualed: function (state) {
      data.equaled = state
    },
    //重置算式为结果
    setFormulaFromResult: function () {
      this.setFormula(data.curResult)
    },
    //设置算式
    setFormula: function (num) {
      data.formula = [num]
    },
    //初始化
    init: function () {
      data = {
        curResult: 0, //当前结果
        operand: 0, //操作数
        curOperate: '=', //当前操作
        formula: [0] //当前公式
      }
    }
  }
})()

//2. UI控制器
const UIController = (function () {
  //operand、temp、result:操作数、临时数、结果
  let displayModel = 'operand'
  //DOM查询字符串
  const DOMstrings = {
    operation: '.operation',
    number: '.number',
    formula: '.formula',
    input: '.input',
    button: 'button:not(#close):not(.memory-btn)',
    memory: '.memory-btn'
  }

  //- 按钮高亮渐变
  //1. 添加按钮高亮渐变
  const heightLight = function (e) {
    el = e.target.closest(DOMstrings.button)
    const shiftX = event.clientX
    const shiftY = event.clientY
    el.style.backgroundImage = `radial-gradient(20rem circle at ${shiftX -
      el.getBoundingClientRect().left}px ${shiftY -
      el.getBoundingClientRect().top}px, rgba(255,255,255,0.8),transparent)`
  }

  //2. 移除按钮高亮渐变
  const removeHeightLight = function (e) {
    e.target.style.backgroundImage = 'none'
  }

  //3. 按钮高亮渐变事件
  document.querySelectorAll(DOMstrings.button).forEach(el => {
    el.addEventListener('mousemove', heightLight)
    el.addEventListener('mouseout', removeHeightLight)
  })

  //- 按钮边框渐变
  //1. 获取所有按钮
  const btns = document.querySelectorAll(DOMstrings.button + ',' + DOMstrings.memory)

  //2. 添加事件
  document.addEventListener('mousemove', event => {
    const shiftX = event.clientX
    const shiftY = event.clientY
    btns.forEach(e => {
      e.style.borderImage = `radial-gradient(6rem circle at ${shiftX -
        e.getBoundingClientRect().left}px ${shiftY -
        e.getBoundingClientRect().top}px, #a0a0a0,transparent)`
      e.style.borderImageSlice = 10
    })
  })

  //格式化数字
  //100000 -> 100,000
  const formatNumber = function (number) {
    const numStr = number.toString().replace('-', '')
    const isMinus = number < 0;

    //判断溢出
    if (numStr.includes('Infinity')) {
      displayModel = 'temp'
      return '溢出'
    }
    //判断出错
    if (numStr.includes('NaN')) return '运算出错'

    const hasPoint = numStr.includes('.')
    let [integer, decimal] = numStr.split('.')
    integer = integer.split('')
    const formatinteger = []
    for (let i = 1; integer.length; i++) {
      formatinteger.push(integer.pop())
      if (i % 3 === 0) {
        formatinteger.push(',')
      }
    }
    //去掉多余的逗号
    if (formatinteger[formatinteger.length - 1] === ',') {
      formatinteger.pop()
    }

    //判断是否是小数
    if (hasPoint) {
      decimal = '.' + decimal
    } else {
      decimal = ''
    }

    return (isMinus ? '-' : '') + formatinteger.reverse().join('') + decimal
  }

  return {
    //获取输入
    getInput: function () {
      const input = document
        .querySelector(DOMstrings.input)
        .textContent.replace(/,/g, '')

      return input
    },
    //获取DOM字符串
    getDOMstrings: function () {
      return DOMstrings
    },
    //显示当前式子
    showFormula: function (formula) {
      let text = formula.join('')
      if (text.includes('Infinity')) text = '溢出'
      if (text.includes('NaN')) text = '运算出错'

      document.querySelector(DOMstrings.formula).textContent = text
    },
    //显示当前结果
    showCurResult: function (number) {
      document.querySelector(DOMstrings.input).textContent = formatNumber(
        number
      )
    },
    //隐藏算式
    hiddenFormula: function () {
      document.querySelector(DOMstrings.formula).textContent = ''
    },
    //输入新的数字
    inputNumber: function (number) {
      let input = this.getInput()

      //控制输入是否重置
      if (displayModel === 'temp') {
        input = '0'
        displayModel = 'operand'
      }

      //小数控制
      const hasPoint = input.includes('.')
      let result = '0'

      if (hasPoint) {
        result = formatNumber(input + number)
      } else if (input === '0' && number !== '.') {
        result = number
      } else {
        result = formatNumber(input + number)
      }

      document.querySelector(DOMstrings.input).textContent = result
      return result.replace(/,/g, '')
    },
    clearEntry: function () {
      const input = this.getInput()
      if (input === '0') return

      let result = input
        .split('')
        .slice(0, input.length - 1)
        .join('')
      if (result === '') result = '0'

      document.querySelector(DOMstrings.input).textContent = formatNumber(
        result
      )
      return result.replace(/,/g, '')
    },
    //重置输入
    resetInput: function () {
      document.querySelector(DOMstrings.input).textContent = 0
    },
    //设置显示模式
    setModel: function (model) {
      displayModel = model
    },
    getPi: function () {
      document.querySelector(DOMstrings.input).textContent = Math.PI
    },
    //初始化
    init: function () {
      document.querySelector(DOMstrings.formula).textContent = ''
      document.querySelector(DOMstrings.input).textContent = 0
    }
  }
})()

//3. 全局控制器
const controller = (function (CalCtrl, UICtrl) {
  const DOM = UICtrl.getDOMstrings()
  //加减乘除等于处理
  const basicArithmetic = function (operate) {
    //0. 设置状态
    if (operate === '=') {
      CalCtrl.setEqualed(true)
    } else {
      CalCtrl.setEqualed(false)
    }
    //1. 符号入栈
    CalCtrl.pushOperate(operate)

    //2. 计算结果
    CalCtrl.calculate()

    //3. 显示算式
    UICtrl.showFormula(CalCtrl.getFormula())

    //4. 重置算式
    if (operate === '=') {
      CalCtrl.setFormulaFromResult()
    }

    //5. 显示结果
    UICtrl.showCurResult(CalCtrl.getCurResult())

    //6. 设置当前显示模式为临时
    UICtrl.setModel('temp')
  }

  //使用运算函数
  const useFun = function (fun) {
    //1. 获取输入
    const number = parseFloat(UICtrl.getInput())

    //2. 插入函数
    CalCtrl.useFun(fun, number)

    //3. 计算结果
    CalCtrl.calculate()

    //4. 显示算式
    UICtrl.showFormula(CalCtrl.getFormula())

    //5. 显示结果
    UICtrl.showCurResult(CalCtrl.getCurResult())

    //6. 设置当前显示模式为临时
    UICtrl.setModel('temp')
  }

  //初始化
  const clear = function () {
    //1. 重置数据
    CalCtrl.init()
    //2. 重置页面
    UICtrl.init()
  }

  //后退
  const clearEntry = function () {
    if (CalCtrl.getEqualed()) {
      //1. 隐藏算式
      UICtrl.hiddenFormula()

      //2. 设置显示模式为临时
      UICtrl.setModel('temp')
    } else {
      //1. 后退
      UICtrl.clearEntry()
    }
  }

  //获取PI
  const pi = function () {
    //1. 更新数据
    CalCtrl.getPi()
    //2. 更新页面
    UICtrl.getPi()
  }

  //关闭窗口
  const close = function () {
    window.opener = null
    window.open('', '_self')
    window.close()
  }

  //按键动画
  const clickAnimation = function (el) {
    // console.log(el.classList)
    el.classList.add('click')

    setTimeout(() => {
      el.classList.remove('click')
    }, 100)
  }

  //操作按钮处理
  const operateHandler = function (operate) {
    //四则运算
    if (['+', '-', '×', '÷', '='].includes(operate)) {
      basicArithmetic(operate)
      return
    }
    //运算函数
    if (['sqr', 'sqrt', 'fact', 'negate'].includes(operate)) {
      useFun(operate)
      return
    }

    //其他操作,校验字符，防止恶意运行
    if (['clear', 'clearEntry', 'pi', 'close'].includes(operate)) {
      eval(`${operate}()`)
    }
  }

  //数字按钮处理
  const numberHandler = function (number) {
    const newNumber = parseFloat(UICtrl.inputNumber(number))
    CalCtrl.pushNumber(newNumber)

    if (CalCtrl.getEqualed()) {
      //1. 隐藏算式
      UICtrl.hiddenFormula()

      //2. 重置算式为当前数字
      CalCtrl.setFormula(newNumber)
    }
  }

  //添加事件监听
  const setupEventListeners = function () {
    //操作按钮
    document.querySelectorAll(DOM.operation).forEach(el => {
      el.addEventListener('click', e => {
        const operate = e.target.closest(DOM.operation).getAttribute('id')
        operateHandler(operate)
      })
    })

    //数字按钮
    document.querySelectorAll(DOM.number).forEach(el => {
      el.addEventListener('click', e => {
        const number = e.target.getAttribute('id')
        numberHandler(number)
      })
    })

    document.addEventListener('keydown', e => {
      const key = [
        '+',
        '-',
        '*',
        '/',
        '=',
        'enter',
        'q',
        '!',
        'p',
        'backspace',
        'escape'
      ]
      const id = [
        '+',
        '-',
        '×',
        '÷',
        '=',
        '=',
        'sqr',
        'fact',
        'pi',
        'clearEntry',
        'clear'
      ]
      let element
      //数字
      if ('0123456789.'.includes(e.key)) {
        element = document.getElementById(e.key)
        element.click()
        clickAnimation(element)
      } else {
        const index = key.indexOf(e.key.toLowerCase())
        if (index > -1) {
          element = document.getElementById(id[index])
          element.click()
          clickAnimation(element)
        }
      }
    })
  }

  return {
    init: function () {
      //1. 初始化页面
      UICtrl.init()
      //2. 添加事件监听函数
      setupEventListeners()
      console.log("%c%s", "color: #a1c4fc; font-size: 24px;",
        `
       _    _                         
      | |  | |                        
      | |__| | ___   ___  _   _ _   _ 
      |  __  |/ _ \\ / _ \\| | | | | | |
      | |  | | (_) | (_) | |_| | |_| |
      |_|  |_|\\___/ \\___/ \\__, |\\__,_|
                           __/ |      
                          |___/       
      `)
    }
  }
})(CalController, UIController)

//1.初始化程序
controller.init()