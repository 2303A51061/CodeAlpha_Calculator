class Calculator {
  constructor() {
    this.previousDisplay = document.getElementById('previous-display');
    this.currentDisplay = document.getElementById('current-display');
    this.displayElement = document.querySelector('.display');

    this.currentOperand = '';
    this.previousOperand = '';
    this.operation = null;
    this.waitingForNewOperand = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.querySelectorAll('.btn-number').forEach(button => {
      button.addEventListener('click', () => {
        this.appendNumber(button.textContent);
        this.animateButton(button);
      });
    });

    document.querySelectorAll('.btn-operator').forEach(button => {
      const operation = this.getOperationFromButton(button.id);
      if (operation) {
        button.addEventListener('click', () => {
          this.chooseOperation(operation);
          this.animateButton(button);
        });
      }
    });

    document.getElementById('equals').addEventListener('click', () => {
      this.compute();
      this.animateButton(document.getElementById('equals'));
    });

    document.getElementById('clear').addEventListener('click', () => {
      this.clear();
      this.animateButton(document.getElementById('clear'));
    });

    document.getElementById('clear-entry').addEventListener('click', () => {
      this.clearEntry();
      this.animateButton(document.getElementById('clear-entry'));
    });

    document.getElementById('backspace').addEventListener('click', () => {
      this.backspace();
      this.animateButton(document.getElementById('backspace'));
    });

    document.getElementById('decimal').addEventListener('click', () => {
      this.appendDecimal();
      this.animateButton(document.getElementById('decimal'));
    });

    document.addEventListener('keydown', (e) => {
      this.handleKeyboardInput(e);
    });
  }

  getOperationFromButton(buttonId) {
    const operationMap = {
      'add': '+',
      'subtract': '-',
      'multiply': '×',
      'divide': '÷'
    };
    return operationMap[buttonId];
  }

  appendNumber(number) {
    if (this.waitingForNewOperand) {
      this.currentOperand = number;
      this.waitingForNewOperand = false;
    } else {
      this.currentOperand = this.currentOperand === '0' ? number : this.currentOperand + number;
    }
    this.updateDisplay();
  }

  appendDecimal() {
    if (this.waitingForNewOperand) {
      this.currentOperand = '0.';
      this.waitingForNewOperand = false;
    } else if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
    }
    this.updateDisplay();
  }

  chooseOperation(nextOperation) {
    if (this.currentOperand === '') return;

    if (this.previousOperand !== '' && !this.waitingForNewOperand) {
      this.compute();
    }

    this.operation = nextOperation;
    this.previousOperand = this.currentOperand;
    this.waitingForNewOperand = true;
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        if (current === 0) {
          this.showError('Cannot divide by zero');
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // ✅ Show full expression at the top
    this.previousDisplay.textContent = `${this.previousOperand} ${this.operation} ${this.currentOperand} =`;

    // Show only result below
    this.currentOperand = this.roundNumber(computation).toString();

    this.operation = null;
    this.previousOperand = '';
    this.waitingForNewOperand = true;
    this.showSuccess();
    this.updateDisplay();
  }

  roundNumber(num) {
    return Math.round((num + Number.EPSILON) * 100000000) / 100000000;
  }

  clear() {
    this.currentOperand = '';
    this.previousOperand = '';
    this.operation = null;
    this.waitingForNewOperand = false;
    this.clearDisplayState();
    this.updateDisplay();
  }

  clearEntry() {
    this.currentOperand = '';
    this.waitingForNewOperand = false;
    this.clearDisplayState();
    this.updateDisplay();
  }

  backspace() {
    if (this.waitingForNewOperand) return;

    this.currentOperand = this.currentOperand.slice(0, -1);
    if (this.currentOperand === '') {
      this.currentOperand = '0';
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.currentDisplay.textContent = this.currentOperand || '0';

    // Don't override the full expression after equals
    if (this.operation != null && this.previousOperand !== '') {
      this.previousDisplay.textContent = `${this.previousOperand} ${this.operation}`;
    }
    // Remove the else part to preserve = expression after compute
  }

  showError(message) {
    this.displayElement.classList.add('error');
    this.currentDisplay.textContent = message;
    setTimeout(() => {
      this.clear();
    }, 2000);
  }

  showSuccess() {
    this.displayElement.classList.add('success');
    setTimeout(() => {
      this.displayElement.classList.remove('success');
    }, 500);
  }

  clearDisplayState() {
    this.displayElement.classList.remove('error', 'success');
  }

  animateButton(button) {
    button.classList.add('animate');
    setTimeout(() => {
      button.classList.remove('animate');
    }, 100);
  }

  handleKeyboardInput(e) {
    const key = e.key;

    if (/[0-9+\-*/.=]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
      e.preventDefault();
    }

    if (/[0-9]/.test(key)) {
      this.appendNumber(key);
      this.highlightButton(this.getButtonByNumber(key));
    } else if (key === '+') {
      this.chooseOperation('+');
      this.highlightButton(document.getElementById('add'));
    } else if (key === '-') {
      this.chooseOperation('-');
      this.highlightButton(document.getElementById('subtract'));
    } else if (key === '*') {
      this.chooseOperation('×');
      this.highlightButton(document.getElementById('multiply'));
    } else if (key === '/') {
      this.chooseOperation('÷');
      this.highlightButton(document.getElementById('divide'));
    } else if (key === 'Enter' || key === '=') {
      this.compute();
      this.highlightButton(document.getElementById('equals'));
    } else if (key === 'Escape') {
      this.clear();
      this.highlightButton(document.getElementById('clear'));
    } else if (key === 'Backspace') {
      this.backspace();
      this.highlightButton(document.getElementById('backspace'));
    } else if (key === '.') {
      this.appendDecimal();
      this.highlightButton(document.getElementById('decimal'));
    }
  }

  getButtonByNumber(number) {
    const numberMap = {
      '0': 'zero',
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine'
    };
    return document.getElementById(numberMap[number]);
  }

  highlightButton(button) {
    if (button) {
      button.classList.add('pressed');
      setTimeout(() => {
        button.classList.remove('pressed');
      }, 100);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});
