QUnit.test('Markers for arearange.', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'arearange',
            width: 600
        },

        tooltip: {
            shared: true
        },

        series: [
            {
                marker: {
                    enabled: true
                },
                data: [
                    [0, 10],
                    [10, 20],
                    [30, 35],
                    [30, 31]
                ],
                boostThreshold: 450
            }
        ]
    });

    function randomData(n) {
        var d = [];

        for (var i = 0; i < n; i++) {
            d.push([n, n + 5]);
        }

        return d;
    }

    chart.series[0].points.forEach(point => {
        assert.ok(
            point.graphics[0] !== undefined,
            'Bottom marker for point: x=' + point.x + ' exists.'
        );
        assert.ok(
            point.graphics[1] !== undefined,
            'Top marker for point: x=' + point.x + ' exists.'
        );
    });

    // #6985
    chart.series[0].setData(randomData(400));
    chart.xAxis[0].setExtremes(5, 15);

    assert.strictEqual(
        // Each point has two markers, and
        // by default extra marker in legend
        document
            .getElementById('container') // Check only this chart..
            .getElementsByClassName('highcharts-point').length,
        chart.series[0].points.length * 2 + 1,
        'No artifacts after zoom (#6985)'
    );

    // #7557
    chart.series[0].setData(randomData(450));
    chart.xAxis[0].setExtremes(5, 15);
    chart.xAxis[0].setExtremes(null, null);

    assert.strictEqual(
        document
            .getElementById('container') // Check only this chart..
            .getElementsByClassName('highcharts-point').length,
        1, // Marker in the legend
        'No artifacts after zoom in boost mode (#7557)'
    );

    chart.update({
        chart: {
            zooming: {
                type: 'x'
            }
        },
        series: [{
            marker: {
                enabled: undefined
            },
            boostThreshold: 1000
        }]
    });

    const xAxis = chart.xAxis[0];

    xAxis.setExtremes(0, 5);
    xAxis.setExtremes();

    assert.notOk(
        !!xAxis.series[0].points[0].graphics[0],
        `Bottom point's graphic shouldn't exist when chart is zoomed out,
        #18080.`
    );
    assert.notOk(
        !!xAxis.series[0].points[0].graphics[1],
        `Top point's graphic shouldn't exist when chart is zoomed out,
        #18080.`
    );

    xAxis.setExtremes(0, 5);

    assert.ok(
        xAxis.series[0].points[0].graphics[0].element,
        `Bottom point's graphic should exist when chart is zoomed, #18080.`
    );

    assert.ok(
        xAxis.series[0].points[0].graphics[1].element,
        `Top point's graphic should exist when chart is zoomed, #18080.`
    );

});

QUnit.test('Zones', function (assert) {
    var chart = Highcharts.chart('container', {
        title: {
            text: 'Arearange with zones'
        },

        series: [
            {
                data: [
                    [-3, -1],
                    [-2, 0],
                    [-1, 1],
                    [0, 2],
                    [1, 3],
                    [0, 2],
                    [-1, 1],
                    [-2, 0],
                    [-3, -1]
                ],
                type: 'arearange',
                zones: [
                    {
                        value: 0,
                        color: 'red'
                    }
                ],
                marker: {
                    enabled: true
                },
                color: 'blue'
            }
        ]
    });

    assert.deepEqual(
        chart.series[0].points.map(function (p) {
            return [p.graphics[1].attr('fill'), p.graphics[0].attr('fill')];
        }),
        [
            ['red', 'red'],
            ['blue', 'red'],
            ['blue', 'red'],
            ['blue', 'blue'],
            ['blue', 'blue'],
            ['blue', 'blue'],
            ['blue', 'red'],
            ['blue', 'red'],
            ['red', 'red']
        ],
        'Upper and lower markers should individually respect the zone setting (#8100)'
    );
});

QUnit.test('Shared tooltip marker.', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'arearange',
            width: 600
        },

        tooltip: {
            shared: true
        },

        series: [
            {
                data: (function () {
                    var ranges = [];
                    for (var i = 0; i < 100; i++) {
                        ranges.push([Math.random(), 10 + Math.random()]);
                    }
                    return ranges;
                }())
            }
        ]
    });

    chart.tooltip.refresh([chart.series[0].points[10]]);

    assert.ok(
        chart.series[0].upperStateMarkerGraphic,
        'Top shared marker exists'
    );
    assert.ok(
        chart.series[0].stateMarkerGraphic,
        'Bottom shared marker exists (stored at stateMarkerGraphic due to #7021)'
    );
    assert.ok(
        chart.series[0].upperStateMarkerGraphic.d !==
            chart.series[0].stateMarkerGraphic.d,
        'Shared markers are not rendered in the same position'
    );

    chart.destroy();
    assert.ok(true, 'Destroyed without any errors (#7021)');
});
