import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("./public/Processed_Arrest_Data.csv").then(data => {
    data.forEach(d => {
        d.ARREST_DATE = new Date(d.ARREST_DATE);
        d.DAY_OF_YEAR = +d3.timeFormat("%j")(d.ARREST_DATE); // 1–366
        d.YEAR = +d.YEAR;
        d.TOTAL = +d.TOTAL;
        d.F = +d.F;
        d.M = +d.M;
        d.V = +d.V;

        const weightedScore = (d.F * 3 + d.M * 2 + d.V * 1);
        d.SEVERITY_SCORE = weightedScore / d.TOTAL; // 1 to 3
    });

    const svg = d3.select("#temporal-structure")
        .style("background-color", "#000"); // black background

    const width = svg.node().getBoundingClientRect().width;
    const height = +svg.attr("height");
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };

    const x = d3.scaleLinear()
        .domain([1, 366])
        .range([margin.left, width - margin.right]);

    const years = [...new Set(data.map(d => d.YEAR))];
    const y = d3.scaleBand()
        .domain(years)
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.TOTAL)])
        .range(["#000000", "#ff006f"]); // dark grey → pink for visibility

    const r = d3.scaleLinear()
        .domain([1, 3])
        .range([0.1, 8]);

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.DAY_OF_YEAR))
        .attr("cy", d => y(d.YEAR) + y.bandwidth() / 2)
        .attr("r", d => r(d.SEVERITY_SCORE))
        .attr("fill", d => colorScale(d.TOTAL));

    const monthTicks = d3.range(0, 12).map(m =>
        +d3.timeFormat("%j")(new Date(2000, m, 1))
    );

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
            d3.axisBottom(x)
                .tickValues(monthTicks)
                .tickFormat(d => d3.timeFormat("%b")(new Date(2000, 0, d)))
        )
        .selectAll("text")
        .style("fill", "#fff"); // white text

    // Y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#fff"); // white text
});
