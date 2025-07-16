

var graphSketch3 = function () {
  const width = 800;
  const height = 400;

  Promise.all([
    d3.csv('./public/nodes.csv'),
    d3.csv('./public/edges.csv')
  ]).then(function ([nodesData, edgesData]) {
    const nodes = nodesData.map(d => ({
      id: d.id,
      name: d.name,
      role: d.role,
      size: +d.size,
      color: d.color
    }));

    const links = edgesData.map(d => ({
      source: d.source,
      target: d.target,
      relationship: d.relationship,
      type: d.type
    }));

    createGraph(nodes, links);
  }).catch(function (error) {
    console.error('Error loading CSV files:', error);
    const fallbackNodes = [
      { id: 'Error', name: 'CSV Load Error', role: 'error', size: 30, color: '#ff0000' }
    ];
    const fallbackLinks = [];
    createGraph(fallbackNodes, fallbackLinks);
  });

  function createGraph(nodes, links) {
    const svg = d3.select('#relational-structure')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#000');

    const g = svg.append('g');

    // Default arrowhead
    g.append('defs').append('marker')
      .attr('id', 'arrowhead-default')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .append('path')
      .attr('d', 'M 0,-4 L 8,0 L 0,4')
      .attr('fill', '#555');

    // Highlighted arrowhead
    g.append('defs').append('marker')
      .attr('id', 'arrowhead-highlight')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .append('path')
      .attr('d', 'M 0,-4 L 8,0 L 0,4')
      .attr('fill', '#fff');

    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 4));

    const link = g.append('g')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('marker-end', 'url(#arrowhead-default)');

    const node = g.append('g')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.size || 20)
      .attr('fill', d => d.color || '#888')
      .call(drag(simulation));

    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', 8)
      .attr('fill', '#fff')
      .text(d => d.name)
      .style('cursor', 'default')
      .style('pointer-events', 'none')


    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(255,255,255,1)')
      .style('color', 'black')
      .style('padding', '8px')
      .style('border-radius', '0px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    node.on('mouseover', (event, d) => {

      // Highlight links
      link
        .style('stroke-opacity', l =>
          d ? (l.source.id === d.id || l.target.id === d.id ? 1 : 0.3) : 1
        )
        .style('stroke', l =>
          l.source.id === d.id || l.target.id === d.id ? '#fff' : '#555'
        )
        .attr('marker-end', l => {
          if (l.type === 'directed') {
            return (l.source.id === d.id || l.target.id === d.id)
              ? 'url(#arrowhead-highlight)'
              : 'url(#arrowhead-default)';
          }
          return null;
        });

      // Highlight connected nodes and dim others
      node
        .style('stroke', n =>
          n.id === d.id || links.some(l =>
            (l.source.id === d.id && l.target.id === n.id) ||
            (l.target.id === d.id && l.source.id === n.id)
          ) ? '#fff' : '#555'
        )
        .style('opacity', n =>
          n.id === d.id || links.some(l =>
            (l.source.id === d.id && l.target.id === n.id) ||
            (l.target.id === d.id && l.source.id === n.id)
          ) ? 1 : 0.3
        );

      // Highlight labels of connected nodes
      label
        .style('opacity', n =>
          n.id === d.id || links.some(l =>
            (l.source.id === d.id && l.target.id === n.id) ||
            (l.target.id === d.id && l.source.id === n.id)
          ) ? 1 : 0.3
        );

      tooltip.transition().duration(200).style('opacity', 1);
      // tooltip.html(`${d.role}`)
      //   .style('left', (event.pageX + 10) + 'px')
      //   .style('top', (event.pageY - 10) + 'px');
    })
      .on('mouseout', () => {
        link
          .style('stroke-opacity', 0.6)
          .style('stroke', '#555')
          .attr('marker-end', d => d.type === 'directed' ? 'url(#arrowhead-default)' : null);

        node
          .style('stroke', '#555')
          .style('opacity', 1);

        label.style('opacity', 1);

        tooltip.transition().duration(300).style('opacity', 0);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rSource = d.source.size || 20;
          return d.source.x + (dx * rSource) / dist;
        })
        .attr('y1', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rSource = d.source.size || 20;
          return d.source.y + (dy * rSource) / dist;
        })
        .attr('x2', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rTarget = d.target.size || 20;
          return d.target.x - (dx * rTarget) / dist;
        })
        .attr('y2', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rTarget = d.target.size || 20;
          return d.target.y - (dy * rTarget) / dist;
        });

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function drag(simulation) {
      return d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }



    // ============================================================================
    // LEGEND
    // ============================================================================

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)');  // Position top-left corner

    const legendData = [
      { label: 'Person', color: '#ff3800' },
      { label: 'Concept', color: '#8C9D29' },
      { label: 'System', color: '#631762' },
      { label: 'Language', color: '#1F7F92' },
      { label: 'Application', color: '#848484' }
    ];

    legend.selectAll('rect')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 22)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', d => d.color);

    legend.selectAll('text')
      .data(legendData)
      .enter()
      .append('text')
      .attr('x', 22)
      .attr('y', (d, i) => i * 22 + 12)
      .attr('font-size', 12)
      .attr('fill', '#fff')
      .text(d => d.label);

  }
};

graphSketch3();



