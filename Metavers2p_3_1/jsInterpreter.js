const TOKENS = {
  CLASS: 'CLASS',
  VAR: 'VAR', 
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  EOF: 'EOF'
}

class Lexer {
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.currentToken = null;
  }

  next() {
    if (this.pos >= this.text.length) {
      this.currentToken = {
        type: TOKENS.EOF,
        value: null
      };
      return this.currentToken;
    }
    
    let char = this.text[this.pos];

    if (char === ' ' || char === '\n' || char === '\t') {
      this.pos++;
      return this.next();
    }

    if (char === ';') {
      this.pos++;
      return this.next(); 
    }

    if (char === '{') {
      this.pos++;
      return this.next();
    }

    if (char === '}') {
      this.pos++;
      return this.next();
    }
    
    if (this.isLetter(char)) {
      let value = this.readIdentifier();
      return {
        type: TOKENS.VAR,
        value: value
      };
    }

    if (this.isDigit(char)) {
      let value = this.readNumber();
      return {
        type: Number.isInteger(value) ? TOKENS.NUMBER : TOKENS.DECIMAL,
        value: value
      };
    }

    if (char === '"') {
      let value = this.readString();
      return {
        type: TOKENS.STRING,
        value: value  
      };
    }
    
    // Gestion erreur
    throw new SyntaxError(`Unexpected character: ${char}`);
  }
  
  // Méthodes auxiliaires de lecture du texte
  readIdentifier() {
    // Lit le nom d'une variable
  }
  
  readNumber() {
    // Lit un nombre
  }

  readString() {
    // Lit une chaîne de caractères entre guillemets
  }

  isLetter(char) {
    const regexLetter = /[a-zA-Z]/;
    return regexLetter.test(char); 
  }

  isDigit(char) {
    const regexDigit = /\d/;
    return regexDigit.test(char);
  }
}





const text = `
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let vec = new Vector(1, 2);
`;

const lexerJS = new Lexer(text);

//lexerJS.next(); // { type: 'CLASS', value: 'Vector' }
//lexerJS.next(); // { type: 'VAR', value: 'vec' } 
//lexerJS.next(); // { type: 'NUMBER', value: 1 }
// etc...