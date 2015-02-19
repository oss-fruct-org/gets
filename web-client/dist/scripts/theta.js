(function (definition) {
    /* global module, define */
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.theta_star = exports.theta_star;
        window.Graph = exports.Graph;
    }
})(function () {
    
    function pathTo(node) {
        var curr = node,
            path = [];
        while (curr.parent) {           
            path.push(curr);
            if (curr === curr.parent) break;
            curr = curr.parent;
        }
        return path.reverse();
    }
    
    function getHeap() {
        return new BinaryHeap(function (node) {
            return node.f;
        });
    }
           
    var theta_star = {
        search: function (graph, start, end) {
            var heuristic = theta_star.heuristics.euclidian,
                openHeap = [],
                bigValue = 999999;
        
            var updateVertex = function (curN, neighN) {
                var gOld = neighN.g;
                
                // Compute cost
                if (theta_star.lineOfSightCheck(graph, curN.parent, neighN)) {
                    var cost_path2 = curN.parent.g + heuristic(curN.parent, neighN);
                    if (cost_path2 < neighN.g) {
                        neighN.parent = curN.parent;
                        neighN.g = cost_path2;
                    }
                } else {
                    var cost_path1 = curN.g + heuristic(curN, neighN);
                    if (cost_path1 < neighN.g) {
                        neighN.parent = curN;
                        neighN.g = cost_path1;
                    }
                }
                
                if (neighN.g < gOld) {
                    var index = openHeap.indexOf(neighN);
                    if (index > -1) {
                        openHeap.splice(index, 1);
                    }
                    neighN.f = neighN.g + heuristic(neighN, end);
                    openHeap.push(neighN);
                }              
            };
                                
            start.parent = start;
            start.g = 0;
            start.h = heuristic(start, end);
            start.f = start.g + start.h;
            
            openHeap.push(start);
            
            while (openHeap.length > 0) {
                // Grab the lowest f(x) to process next
                var lowInd = 0;
                for (var i = 0; i < openHeap.length; i++) {
                    if (openHeap[i].f < openHeap[lowInd].f) {
                        lowInd = i;
                    }
                }
                var currentNode = openHeap[lowInd];
                openHeap.splice(lowInd, 1);
                
                if (currentNode === end) {
                    return pathTo(currentNode);
                }
                
                currentNode.closed = true;
                
                var neighbors = graph.neighbors(currentNode);
                for (var i = 0, il = neighbors.length; i < il; ++i) {
                    var neighbor = neighbors[i];
                    if (neighbor.closed || neighbor.isWall()) {
                        continue;
                    }
                    if (!(openHeap.indexOf(neighbor) > -1)) {
                        neighbor.g = bigValue;
                        neighbor.parent = null;
                    }
                    updateVertex(currentNode, neighbor);                   
                }
            }
            
            Logger.debug('No path found');
            return [];

        },
        heuristics: {
            manhattan: function (pos0, pos1) {
                var d1 = Math.abs(pos1.x - pos0.x);
                var d2 = Math.abs(pos1.y - pos0.y);
                return d1 + d2;
            },
            diagonal: function (pos0, pos1) {
                var D = 1;
                var D2 = Math.sqrt(2);
                var d1 = Math.abs(pos1.x - pos0.x);
                var d2 = Math.abs(pos1.y - pos0.y);
                return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
            },
            euclidian: function (pos0, pos1) {
                var D = 1;
                var dx = Math.abs(pos0.x - pos1.x);
                var dy = Math.abs(pos0.y - pos1.y);
                return D * Math.sqrt(dx * dx + dy * dy);
            }
        },
        lineOfSightCheck: function (graph, currentNode, parent) {
            //Logger.debug('---------lineOfSightCheck-start--------------------');
            //Logger.debug(currentNode);
            //Logger.debug(parent);
            var x_0 = currentNode.x,
                y_0 = currentNode.y,
                x_1 = parent.x,
                y_1 = parent.y;
        
            var d_x = x_1 - x_0,
                d_y = y_1 - y_0,
                f = 0,
                s_x, s_y;
                    
            if (d_y < 0) {
                d_y = -d_y;
                s_y = -1;
            } else {
                s_y = 1;
            } 
            
            if (d_x < 0) {
                d_x = -d_x;
                s_x = -1;
            } else {
                s_x = 1;
            }
            
            if (d_x >= d_y) {
                while(x_0 !== x_1) {
                    f += d_y;
                    if (f >= d_x) {
                        if (graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0 + (s_y - 1) / 2)) {
                            return false;
                        }
                        y_0 += s_y;
                        f -= d_x;
                    }
                    if ((f !== 0) && graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0 + (s_y - 1) / 2)) {
                        return false;
                    }
                    if ((d_y === 0) && graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0) && graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0 - 1)) {
                        return false;
                    }
                    x_0 += s_x;
                }
            } else {
                while(y_0 !== y_1) {
                    f += d_x;
                    if (f >= d_y) {
                        if (graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0 + (s_y - 1) / 2)) {
                            return false;
                        }
                        x_0 += s_x;
                        f -= d_y;
                    }
                    if ((f !== 0) && graph.isPositionBlocked(x_0 + (s_x - 1) / 2, y_0 + (s_y - 1) / 2)) {
                        return false;
                    }
                    if ((d_x === 0) && graph.isPositionBlocked(x_0, y_0 + (s_y - 1) / 2) && graph.isPositionBlocked(x_0 - 1, y_0 + (s_y - 1) / 2)) {
                        return false;
                    }
                    y_0 += s_y;
                }
            }
            return true;               
        },
        cleanNode: function (node) {
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    };
         
    /**
     * A graph memory structure
     * @param {Array} gridIn 2D array of input weights
     */
    function Graph(gridIn) {
        this.grid = [];
        for (var x = 0; x < gridIn.length; x++) {
            this.grid[x] = [];

            for (var y = 0, row = gridIn[x]; y < row.length; y++) {
                var node = new GridNode(x, y, row[y]);
                this.grid[x][y] = node;
            }
        }
        this.init();
    }
    
    Graph.prototype.init = function () {
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                theta_star.cleanNode(this.grid[i][j]);
            }
        }
    };
    
    Graph.prototype.neighbors = function (node) {
        var ret = [],
            x = node.x,
            y = node.y,
            grid = this.grid;

        // West
        if (grid[x - 1] && grid[x - 1][y]) {
            ret.push(grid[x - 1][y]);
        }

        // East
        if (grid[x + 1] && grid[x + 1][y]) {
            ret.push(grid[x + 1][y]);
        }

        // South
        if (grid[x] && grid[x][y - 1]) {
            ret.push(grid[x][y - 1]);
        }

        // North
        if (grid[x] && grid[x][y + 1]) {
            ret.push(grid[x][y + 1]);
        }

        // Southwest
        if (grid[x - 1] && grid[x - 1][y - 1]) {
            ret.push(grid[x - 1][y - 1]);
        }

        // Southeast
        if (grid[x + 1] && grid[x + 1][y - 1]) {
            ret.push(grid[x + 1][y - 1]);
        }

        // Northwest
        if (grid[x - 1] && grid[x - 1][y + 1]) {
            ret.push(grid[x - 1][y + 1]);
        }

        // Northeast
        if (grid[x + 1] && grid[x + 1][y + 1]) {
            ret.push(grid[x + 1][y + 1]);
        }

        return ret;
    };
    
    Graph.prototype.isPositionBlocked = function (x, y) {
        if (x < 0 || y < 0) return true;
        //Logger.debug('--------------------------------------');
        //Logger.debug('this.grid[x][y]: ' + x + ', ' + y);
        //Logger.debug('--------------------------------------');
        return this.grid[x][y].weight === 0;
    };
    
    function GridNode(x, y, weight) {
        this.x = x;
        this.y = y;
        this.weight = weight;
    }

    GridNode.prototype.toString = function () {
        return "[" + this.x + " " + this.y + "]";
    };

    GridNode.prototype.getCost = function () {
        return this.weight;
    };

    GridNode.prototype.isWall = function () {
        return this.weight === 0;
    };
    
    function BinaryHeap(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
    
    BinaryHeap.prototype = {
        push: function (element) {
            // Add the new element to the end of the array.
            this.content.push(element);

            // Allow it to sink down.
            this.sinkDown(this.content.length - 1);
        },
        pop: function () {
            // Store the first element so we can return it later.
            var result = this.content[0];
            // Get the element at the end of the array.
            var end = this.content.pop();
            // If there are any elements left, put the end element at the
            // start, and let it bubble up.
            if (this.content.length > 0) {
                this.content[0] = end;
                this.bubbleUp(0);
            }
            return result;
        },
        remove: function (node) {
            var i = this.content.indexOf(node);

            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            var end = this.content.pop();

            if (i !== this.content.length - 1) {
                this.content[i] = end;

                if (this.scoreFunction(end) < this.scoreFunction(node)) {
                    this.sinkDown(i);
                }
                else {
                    this.bubbleUp(i);
                }
            }
        },
        size: function () {
            return this.content.length;
        },
        rescoreElement: function (node) {
            this.sinkDown(this.content.indexOf(node));
        },
        sinkDown: function (n) {
            // Fetch the element that has to be sunk.
            var element = this.content[n];

            // When at 0, an element can not sink any further.
            while (n > 0) {

                // Compute the parent element's index, and fetch it.
                var parentN = ((n + 1) >> 1) - 1,
                        parent = this.content[parentN];
                // Swap the elements if the parent is greater.
                if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                    this.content[parentN] = element;
                    this.content[n] = parent;
                    // Update 'n' to continue at the new position.
                    n = parentN;
                }
                // Found a parent that is less, no need to sink any further.
                else {
                    break;
                }
            }
        },
        bubbleUp: function (n) {
            // Look up the target element and its score.
            var length = this.content.length,
                    element = this.content[n],
                    elemScore = this.scoreFunction(element);

            while (true) {
                // Compute the indices of the child elements.
                var child2N = (n + 1) << 1,
                        child1N = child2N - 1;
                // This is used to store the new position of the element, if any.
                var swap = null,
                        child1Score;
                // If the first child exists (is inside the array)...
                if (child1N < length) {
                    // Look it up and compute its score.
                    var child1 = this.content[child1N];
                    child1Score = this.scoreFunction(child1);

                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore) {
                        swap = child1N;
                    }
                }

                // Do the same checks for the other child.
                if (child2N < length) {
                    var child2 = this.content[child2N],
                            child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }

                // If the element needs to be moved, swap it, and continue.
                if (swap !== null) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = element;
                    n = swap;
                }
                // Otherwise, we are done.
                else {
                    break;
                }
            }
        }
    };
    
    return {
        theta_star: theta_star,
        Graph: Graph
    };
});