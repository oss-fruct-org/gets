(function (definition) {
    /* global module, define */
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.astar_tri = exports.astar_tri;
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

    var astar_tri = {
        search: function (tri, start, end, start_p, end_p, map) {            
            var openHeap = getHeap(),
                bigValue = 999999999;
        
            var dist = astar_tri.heuristics.euclidian_p2p(start_p, end_p); 
            
            var dot = function (p0, p1) {
                return p0.x * p1.x + p0.y * p1.y;
            };

            var cross = function (p0, p1) {
                return p0.x * p1.y - p0.y * p1.x;
            };

            var angle = function (p0, p1) {
                var angle2 = Math.atan2(cross(p0, p1), dot(p0, p1));
                return Math.abs(angle2);
            };
            
            /*var getAngle = function (curN, neighN) {
                for (var p = 0; p < neighN.neighbors_.length; p++) {
                    if (neighN.neighbors_[p] === curN) {
                        
                    }
                }
            };*/
            var distanceBetweenTriangles = function (curN, neighN) {
                var curN_MidPoint = {
                    x: (curN.points_[0].x + curN.points_[1].x + curN.points_[2].x) / 3, 
                    y: (curN.points_[0].y + curN.points_[1].y + curN.points_[2].y) / 3
                };
                var neighN_MidPoint = {
                    x: (neighN.points_[0].x + neighN.points_[1].x + neighN.points_[2].x) / 3, 
                    y: (neighN.points_[0].y + neighN.points_[1].y + neighN.points_[2].y) / 3
                };
                
                return astar_tri.heuristics.euclidian_p2p(curN_MidPoint, neighN_MidPoint);
            };
            
            var updateVertex = function (curN, neighN, i) {
                //Logger.debug(curN.points_);
                //Logger.debug(neighN.points_);
                //Logger.debug('-------------');               
                var bound0 = astar_tri.heuristics.euclidian_p2e(start_p, curN.points_[(i + 2) % 3], curN.points_[(i + 1) % 3]),
                    //bound1 = curN.g + distanceBetweenTriangles(curN, neighN),
                    bound2 = curN.g + (curN.h - astar_tri.heuristics.euclidian_p2e(end_p, curN.points_[(i + 2) % 3], curN.points_[(i + 1) % 3]));
                var cost_path = Math.max(bound0, bound2);//bound1;//
                //Logger.debug(cost_path);
                if (cost_path < neighN.g) {
                    neighN.parent = curN;
                    neighN.g = cost_path;
                    if (neighN.visited) {
                        openHeap.remove(neighN);
                    } else {
                        neighN.visited = true;
                    }
                    neighN.h = astar_tri.heuristics.euclidian_p2e(end_p, curN.points_[(i + 2) % 3], curN.points_[(i + 1) % 3]);
                    neighN.f = neighN.g + neighN.h;
                    openHeap.push(neighN);
                }
            };
                       
            for (var i = 0, len = tri.length; i < len; i++) {
                astar_tri.cleanNode(tri[i]);
            }
            
            
            start.parent = start;
            start.h = dist;
            start.f = start.g + start.h;
            
            openHeap.push(start);
                       
            while (openHeap.size() > 0) {               

                // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
                var currentNode = openHeap.pop();
                //map.drawPolygon(currentNode.points_);

                // End case -- result has been found, return the traced path.
                if (currentNode === end) {
                    //Logger.debug(currentNode);
                    return pathTo(currentNode);
                }
                
                // Normal case -- move currentNode from open to closed, process each of its neighbors.
                currentNode.closed = true;

                // Find all neighbors for the current node.
                var neighbors = currentNode.neighbors_;
                var constrained_edges = currentNode.constrained_edge;
                for (var i = 0, il = neighbors.length; i < il; ++i) {
                    var neighbor = neighbors[i];
                    if (!neighbor || neighbor.closed || constrained_edges[i]) {
                        continue;
                    }
                    //map.drawPolygon(neighbor.points_);
                    
                    var beenVisited = neighbor.visited;
                                       
                    /*
                     * Here insted of of all:
                     * - calculate h(neighbor)
                     * - calculate g(neighbor)
                     */
                    if (!beenVisited) {
                        neighbor.g = bigValue;
                        neighbor.parent = null;
                    }
                    updateVertex(currentNode, neighbor, i);                 
                }
                //break;
            }
            
        },
        heuristics: {
            euclidian_p2p: function (pos0, pos1) {
                var dx = Math.abs(pos0.x - pos1.x);
                var dy = Math.abs(pos0.y - pos1.y);
                return Math.sqrt(dx * dx + dy * dy);
            },
            euclidian_p2e: function (point, edge_s, edge_e) {
                var A = point.x - edge_s.x,
                    B = point.y - edge_s.y,
                    C = edge_e.x - edge_s.x,
                    D = edge_e.y - edge_s.y;

                var dot = A * C + B * D,
                    len_sq = C * C + D * D,
                    param = -1;
            
                if (len_sq != 0) //in case of 0 length line
                    param = dot / len_sq;

                var xx, yy;

                if (param < 0) {
                    xx = edge_s.x;
                    yy = edge_s.y;
                }
                else if (param > 1) {
                    xx = edge_e.x;
                    yy = edge_e.y;
                }
                else {
                    xx = edge_s.x + param * C;
                    yy = edge_s.y + param * D;
                }

                var dx = point.x - xx;
                var dy = point.y - yy;
                return Math.sqrt(dx * dx + dy * dy);
            }
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
        astar_tri: astar_tri
    };
});