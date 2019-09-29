// sketches of ds and algorithims

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
}

function insert(element, index) {
  if (index > 0 && index > this.size)
    return false;
  else {
    const node = new Node(element);
    let curr, prev;
    curr = this.head;
    if (index == 0) {
      node.next = head;
      this.head = node;
    } else {
      curr = this.head;
      let it = 0;
      while (it < index) {
        it++;
        prev = curr;
        curr = curr.next;
      }
      node.next = curr;
      prev.next = node;
    }
    this.size++;
  }
}
