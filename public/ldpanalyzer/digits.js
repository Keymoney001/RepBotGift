window.addEventListener(
    'load',
    function () {
        var ws,
            b,
            rnd,
            spot,
            time,
            dps,
            dpsb,
            dps1,
            dps1b,
            dps2,
            dps3,
            ready,
            stripLinesValue,
            xd,
            digit,
            cnt,
            random,
            id,
            lng,
            str,
            chart,
            xVal,
            yVal,
            mType,
            mColor,
            rndMenu;
        let start = 0;
        str = ['R_100', 'R_10', 'R_25', 'R_50', 'R_75', 'RDBEAR', 'RDBULL'];
        thick = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        dps = [];
        dpsb = [];
        dps1 = [];
        dps1b = [];
        dps2 = [];
        dps3 = [];
        stripLinesValue = [];
        time = [0];
        spot = [0];
        tic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        digit = [0];
        mType = 'none';
        mColor = '#32cd32';
        lng = 'EN';
        xVal = 0;
        yVal = 0;
        cnt = 20;

        rndMenu = document.querySelectorAll('div.menu > span');

        for (var i = 0; i < rndMenu.length; i++) {
            clickMenu(rndMenu[i]);
        }

        function toggleMenu(data) {
            for (var i = 0; i < rndMenu.length; i++) {
                rndMenu[i].classList.remove('menu-active');
            }
            data.classList.add('menu-active');
        }

        function clickMenu(data) {
            data.addEventListener('click', function () {
                toggleMenu(data);
            });
        }

        function toggleDigit(d, m) {
            var nameClass = document.querySelector('#digits > span:nth-child(' + d + ')').className;
            if (nameClass != 'digits_moved_' + m) {
                document.querySelector('#digits > span:nth-child(' + d + ')').classList.remove(nameClass);
                document.querySelector('#digits > span:nth-child(' + d + ')').classList.add('digits_moved_' + m);
            }
        }
        function toggleHead(e, s) {
            var nameClass = document.querySelector('#headcol > span:nth-child(' + e + ')').className;
            if (nameClass != 'Head_moved_' + s) {
                document.querySelector('#headcol > span:nth-child(' + e + ')').classList.remove(nameClass);
                document.querySelector('#headcol > span:nth-child(' + e + ')').classList.add('Head_moved_' + s);
            }
        }

        function togglePlace(f, g) {
            var nameClass = document.querySelector('#placecol > span:nth-child(' + f + ')').className;
            if (nameClass != 'Place_moved_' + g) {
                document.querySelector('#placecol > span:nth-child(' + f + ')').classList.remove(nameClass);
                document.querySelector('#placecol > span:nth-child(' + f + ')').classList.add('Place_moved_' + g);
            }
        }

        function toggleArrow(e, d, m) {
            var nameClass = document.querySelector('' + e + ' > span:nth-child(' + d + ')').className;
            if (nameClass != 'Arrow_Bg_' + m) {
                //document.querySelector(""+e+" > span:nth-child("+d+")").classList.remove(nameClass);
                document.querySelector('' + e + ' > span:nth-child(' + d + ')').classList.add('Arrow_Bg_' + m);
            }
        }

        function toggleSpotArrow(h, j) {
            var nameClass = document.querySelector('#SpotArrow > span:nth-child(' + h + ')').className;
            if (nameClass != 'Spot_Arrow_' + j) {
                document.querySelector('#SpotArrow > span:nth-child(' + h + ')').classList.remove(nameClass);
                document.querySelector('#SpotArrow > span:nth-child(' + h + ')').classList.add('Spot_Arrow_' + j);
            }
        }

        function rndGet() {
            random = document.querySelector('body > div.menu > span.menu-active').title;
            switch (random) {
                case str[0]:
                    rnd = 'R_100';
                    xd = 2;
                    break;
                case str[1]:
                    rnd = 'R_10';
                    xd = 3;
                    break;
                case str[2]:
                    rnd = 'R_25';
                    xd = 3;
                    break;
                case str[3]:
                    rnd = 'R_50';
                    xd = 4;
                    break;
                case str[4]:
                    rnd = 'R_75';
                    xd = 4;
                    break;
                case str[5]:
                    rnd = 'RDBEAR';
                    xd = 4;
                    break;
                case str[6]:
                    rnd = 'RDBULL';
                    xd = 4;
                    break;
                default:
                    rnd = 'R';
                    xd = 0;
                    break;
            }
        }

        rndGet();

        ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3738&l=' + lng);

        ws.onopen = function (evt) {
            ws.send(JSON.stringify({ ticks: rnd }));
        };

        ws.onmessage = function (msg) {
            b = JSON.parse(msg.data);

            if (b.tick) {
                rndGet();

                if (b.echo_req.ticks == rnd) {
                    id = b.tick.id;
                    ws.send(
                        JSON.stringify({ ticks_history: rnd, end: 'latest', start: 1, style: 'ticks', count: cnt + 1 })
                    );
                } else {
                    ws.send(JSON.stringify({ forget: id }));
                    ws.send(JSON.stringify({ forget_all: 'ticks' }));
                    ws.send(JSON.stringify({ ticks: rnd }));
                }
            }

            if (b.history) {
                if (b.echo_req.ticks_history == rnd) {
                    if (document.querySelector('#chartContainerDigit > div > a')) {
                        if (document.querySelector('#chartContainerDigit > div > a').innerText != '				') {
                            document.querySelector('#chartContainerDigit > div > a').innerHTML = '				';
                            document.querySelector('#chartContainerDigit > div > a').href = 'https://www.binary.com';
                        }
                    }
                    if (document.querySelector('#chartContainer > div > a')) {
                        if (document.querySelector('#chartContainer > div > a').innerText != '				') {
                            document.querySelector('#chartContainer > div > a').innerHTML = '				';
                            document.querySelector('#chartContainer > div > a').href = 'https://www.binary.com';
                        }
                    }
                    if (document.querySelector('#chartContainerDigitEven > div > a')) {
                        if (document.querySelector('#chartContainerDigitEven > div > a').innerText != '				') {
                            document.querySelector('#chartContainerDigitEven > div > a').innerHTML = '				';
                            document.querySelector('#chartContainerDigitEven > div > a').href =
                                'https://www.binary.com';
                        }
                    }
                    if (document.querySelector('#chartContainerDigitOdd > div > a')) {
                        if (document.querySelector('#chartContainerDigitOdd > div > a').innerText != '				') {
                            document.querySelector('#chartContainerDigitOdd > div > a').innerHTML = '				';
                            document.querySelector('#chartContainerDigitOdd > div > a').href = 'https://www.binary.com';
                        }
                    }
                    if (document.querySelector('#chartContainerAxisCord > div > a')) {
                        if (document.querySelector('#chartContainerAxisCord > div > a').innerText != '				') {
                            document.querySelector('#chartContainerAxisCord > div > a').innerHTML = '				';
                            document.querySelector('#chartContainerAxisCord > div > a').href = 'https://www.binary.com';
                        }
                    }
                    for (var i = 0; i < cnt + 1; i++) {
                        time[i] = b.history.times[cnt - i];
                        spot[i] = b.history.prices[cnt - i];
                        spot[i] = Number(spot[i]).toFixed(xd);
                        digit[i] = spot[i].slice(-1);
                    }

                    for (var i = 0; i < cnt + 1; i++) {
                        // console.log(spot[i] + ' : '+	i)

                        // console.log(spot[i] + ' : '+	i)
                        if (spot[i] > spot[i + 1]) {
                            var mWmColorDigit = '#29abe2'; //цвет цифр в верхнем графике
                        } else if (spot[i] < spot[i + 1]) {
                            var mWmColorDigit = '#c03'; //цвет цифр в верхнем графике
                        }
                        xVal = new Date(time[i] * 1000);
                        yVal = parseFloat(spot[i]);

                        if (i == 0) mType = 'circle';
                        else mType = 'circle';
                        if (yVal == Math.max.apply(null, spot)) {
                            mColor = '#29abe2';
                            mType = 'circle';
                            mSize = 6;
                        } else if (yVal == Math.min.apply(null, spot)) {
                            mColor = '#c03';
                            mType = 'circle';
                            mSize = 6;
                        } else if (i == 0) {
                            mColor = '#32cd32';
                            mSize = 6;
                        } else {
                            mColor = 'black';
                            mSize = 3;
                        }

                        dps.push({
                            x: xVal,
                            y: yVal,

                            indexLabel: digit[i],
                            indexLabelFontWeight: 'bold',
                            indexLabelFontSize: 16,
                            indexLabelFontColor: mWmColorDigit,

                            markerBorderColor: '#ccc',
                            markerSize: mSize,
                            markerType: mType,
                            markerColor: mColor,
                            markerBorderColor: '#ccc',
                        });
                    }

                    if (dps.length > cnt + 1) {
                        while (dps.length != cnt + 1) {
                            dps.shift();
                        }
                    }

                    chart.render();

                    spot.reverse();
                    digit.reverse();

                    for (var i = 1; i < cnt + 1; i++) {
                        document.querySelector('#digits > span:nth-child(' + i + ')').innerHTML = digit[i];

                        yVal2 = parseFloat(spot[20]);
                        if (yVal2 == Math.max.apply(null, spot)) {
                            var HeadThick = 'up';
                            mColorHead = '#29abe2';
                        } else if (yVal2 == Math.min.apply(null, spot)) {
                            var HeadThick = 'down';
                            mColorHead = '#c03';
                        } else {
                            var HeadThick = 'mid';
                            mColorHead = '#32cd32';
                        }

                        if (spot[i - 1] < spot[i]) {
                            toggleDigit(i, 'up');
                            if (digit[i] != 0) {
                                var tic2nd = digit[i] * 1;
                            }
                            if (digit[i - 1] > 5 && digit[i] == 0) {
                                var tic2nd = 10;
                                //console.log("ok")
                            }
                            if (digit[i - 1] <= 5 && digit[i] == 0) {
                                var tic2nd = 0;
                            }
                        } else if (spot[i - 1] > spot[i]) {
                            toggleDigit(i, 'down');
                            if (digit[i] != 0) {
                                var tic2nd = digit[i] * -1;
                            }
                            if (digit[i - 1] > 5 && digit[i] == 0) {
                                var tic2nd = -10;
                            }
                            if (digit[i - 1] <= 5 && digit[i] == 0) {
                                var tic2nd = -0;
                            }
                        } else if (spot[i - 1] == spot[i] && i - 1 > 0) {
                            if (
                                document.querySelector('#digits > span:nth-child(' + (i - 1) + ')').className ==
                                'digits_moved_up'
                            ) {
                                toggleDigit(i, 'up');
                            } else if (
                                document.querySelector('#digits > span:nth-child(' + (i - 1) + ')').className ==
                                'digits_moved_down'
                            ) {
                                toggleDigit(i, 'down');
                            }
                        }

                        tic.shift(0);
                        tic.push(tic2nd);
                    }

                    thick.shift(0);
                    thick.push(HeadThick);

                    for (var i = 1; i < 16; i++) {
                        if (spot[i + 2] > spot[i + 7]) {
                            document.querySelector('#SpotArrow > span:nth-child(' + i + ')').innerHTML = '&#242';
                            toggleSpotArrow(i, 'Up');
                            //  console.log(spot[i+2],"   ",spot[i+7] ,"   ",  i ,"Up ")
                        } else if (spot[i + 2] < spot[i + 7]) {
                            document.querySelector('#SpotArrow > span:nth-child(' + i + ')').innerHTML = '&#241';
                            toggleSpotArrow(i, 'Down');
                            // console.log(spot[i+2],"   ",spot[i+7] ,"   ",  i ,"Down")
                        } else if (spot[i + 2] == spot[i + 7]) {
                            document.querySelector('#SpotArrow > span:nth-child(' + i + ')').innerHTML = 'M';
                            toggleSpotArrow(i, 'Equal');
                            // console.log(spot[i+2],"   ",spot[i+7] ,"   ",  i ,"Equal")
                        }

                        document.querySelector('#SpotArrow > span:nth-child(' + 14 + ')').innerHTML = 'M';
                        toggleSpotArrow(14, 'M');
                        document.querySelector('#SpotArrow > span:nth-child(' + 15 + ')').innerHTML = 'M';
                        toggleSpotArrow(15, 'M');
                        document.querySelector('#SpotArrow > span:nth-child(' + 16 + ')').innerHTML = 'M';
                        toggleSpotArrow(16, 'M');
                        document.querySelector('#SpotArrow > span:nth-child(' + 17 + ')').innerHTML = 'M';
                        toggleSpotArrow(17, 'M');
                        document.querySelector('#SpotArrow > span:nth-child(' + 18 + ')').innerHTML = 'M';
                        toggleSpotArrow(18, 'm');
                        document.querySelector('#SpotArrow > span:nth-child(' + 19 + ')').innerHTML = 'M';
                        toggleSpotArrow(19, 'M');
                        document.querySelector('#SpotArrow > span:nth-child(' + 20 + ')').innerHTML = 'M';
                        toggleSpotArrow(20, 'M');
                    }

                    for (var i = 1; i < cnt + 1; i++) {
                        if (spot[i - 1] < spot[i]) {
                            toggleDigit(i, 'up');
                            mColorBarEven = '#4169E1'; //цвет второго графика синие столбики
                            mColorBarOdd = '#4682B4'; //цвет третьего графика синие столбики
                            var mColorDigit = '#29abe2'; //цвет четвёртого графика синие столбики
                        } else if (spot[i - 1] > spot[i]) {
                            toggleDigit(i, 'down');
                            mColorBarEven = '#DC143C'; //цвет второго графика красные столбики
                            mColorBarOdd = '#CD5C5C'; //цвет третьего графика красные столбики
                            var mColorDigit = '#c03'; //цвет четвёртого графика красные столбики
                        }

                        toggleHead(i, thick[i - 1]);
                        document.querySelector('#headcol > span:nth-child(' + i + ')').innerHTML = tic;

                        xDigit = i;
                        yDigit = parseFloat(tic[i - 1]);

                        if (
                            Math.abs(parseInt(tic[i - 1])) != 8 ||
                            Math.abs(parseInt(tic[i - 1])) != 9 ||
                            Math.abs(parseInt(tic[i - 1])) != 10
                        ) {
                            var fontCol = 'white';
                            var lblPlace = 'inside';
                        }
                        if (
                            Math.abs(parseInt(tic[i - 1])) == 8 ||
                            Math.abs(parseInt(tic[i - 1])) == 9 ||
                            Math.abs(parseInt(tic[i - 1])) == 10
                        ) {
                            var fontCol = 'black';
                            var lblPlace = 'outstde';
                        }

                        if (tic[i - 1] >= 0) {
                            var colRev1 = 'White';
                            var colRev2 = mColorDigit;
                            var lblDigit1 = '';
                            var lblDigit2 = digit[i];
                            var yDigitRevPos = parseFloat(tic[i - 1]);
                            var yDigitRevneg = 10 - parseFloat(tic[i - 1]);
                        }
                        if (tic[i - 1] <= -0) {
                            var colRev1 = mColorDigit;
                            var colRev2 = 'White';
                            var lblDigit1 = digit[i];
                            var lblDigit2 = '';
                            var yDigitRevPos = 10 - Math.abs(parseFloat(tic[i - 1]));
                            var yDigitRevneg = Math.abs(parseFloat(tic[i - 1]));
                        }

                        if (digit[i - 1] - digit[i] == 1 || digit[i - 1] - digit[i] == -1) {
                            var StartSignal = 'Start';
                            var LblSize = 16;
                            var LblBGcolor = 'yellow';
                        } else {
                            var StartSignal = '';
                            var LblSize = 14;
                            var LblBGcolor = 'white';
                        }

                        xDigitEven = i;
                        xDigitOdd = i;
                        if (parseFloat(tic[i - 1]) % 2 == 0) {
                            yDigitEven = parseFloat(tic[i - 1]);
                            var DigiLabelEven = digit[i];
                        } else if (parseFloat(tic[i - 1]) % 2 != 0) {
                            yDigitEven = 0;
                            var DigiLabelEven = ' ';
                        } else if (parseFloat(tic[i - 1]) == 0) {
                            yDigitEven = 0.2;
                        }

                        //|| parseFloat(tic[i-1]) == -0
                        if (parseFloat(tic[i - 1]) % 2 != 0) {
                            yDigitOdd = parseFloat(tic[i - 1]);
                            var DigiLabelOdd = digit[i];
                        } else if (parseFloat(tic[i - 1]) % 2 == 0) {
                            yDigitOdd = 0;
                            var DigiLabelOdd = ' ';
                        }

                        dpsb.push({
                            x: xDigit,
                            y: yDigit,

                            indexLabel: digit[i],
                            indexLabelFontWeight: 'bold',
                            indexLabelFontSize: 11,
                            markerType: 'circle',
                            markerColor: mColorDigit,
                            markerBorderColor: '#ccc',
                        });

                        dps1.push({
                            x: xDigit,
                            y: yDigitRevPos,

                            indexLabel: lblDigit1,
                            //indexLabelFontWeight: "bold",
                            indexLabelFontSize: 18,
                            indexLabelFontColor: fontCol,
                            indexLabelPlacement: lblPlace,
                            color: colRev1,
                            markerBorderColor: '#ccc',
                        });

                        dps1b.push({
                            x: xDigit,
                            y: yDigitRevneg,

                            indexLabel: lblDigit2,
                            //indexLabelFontWeight: "bold",
                            indexLabelFontSize: 18,
                            indexLabelFontColor: fontCol,
                            indexLabelPlacement: lblPlace,
                            color: colRev2,
                            markerBorderColor: '#ccc',
                        });

                        dps2.push({
                            x: xDigitEven,
                            y: yDigitEven,

                            indexLabel: DigiLabelEven,
                            indexLabelFontWeight: 'bold',
                            indexLabelFontSize: LblSize,
                            indexLabelFontColor: mColorDigit,
                            indexLabelBackgroundColor: LblBGcolor,
                            color: mColorBarEven,
                            markerBorderColor: '#ccc',
                        });

                        dps3.push({
                            x: xDigitOdd,
                            y: yDigitOdd,

                            indexLabel: DigiLabelOdd,
                            indexLabelFontWeight: 'bold',
                            indexLabelFontSize: LblSize,
                            indexLabelFontColor: mColorDigit,
                            indexLabelBackgroundColor: LblBGcolor,
                            color: mColorBarOdd,
                            markerBorderColor: '#ccc',
                        });
                    }

                    if (dpsb.length > cnt + 1) {
                        while (dpsb.length != cnt) {
                            dpsb.shift();
                        }
                    }
                    if (dps1.length > cnt + 1) {
                        while (dps1.length != cnt) {
                            dps1.shift();
                        }
                    }
                    if (dps1b.length > cnt + 1) {
                        while (dps1b.length != cnt) {
                            dps1b.shift();
                        }
                    }
                    if (dps2.length > cnt + 1) {
                        while (dps2.length != cnt) {
                            dps2.shift();
                        }
                    }
                    if (dps3.length > cnt + 1) {
                        while (dps3.length != cnt) {
                            dps3.shift();
                        }
                    }

                    chart0.render();
                    chart1.render();
                    chart2.render();
                    chart3.render();

                    tic1 = tic[19];
                    tic2 = tic[18];
                    tic3 = tic[17];
                    tic4 = tic[16];
                    tic5 = tic[15];
                    tic6 = tic[14];

                    var tic1_level = thick[19];
                    var tic2_level = thick[18];
                    var tic3_level = thick[17];
                    var tic4_level = thick[16];
                    var tic5_level = thick[15];
                    var tic6_level = thick[14];
                    //console.log(tic)
                    //console.log('t1',tic1,'Level tic1',tic1_level)
                    ////////////////////

                    //test area
                    //if (tic4_level == 'mid' && tic3_level == 'mid' && tic2_level == 'mid' && tic1_level == 'mid') {
                    if (ready == 1 && start < 6) {
                        start++;
                    }
                    if (digit[19] - digit[20] == 1 || digit[19] - digit[20] == -1) {
                        document.querySelector('#arrow_up > span:nth-child(1)').innerHTML = '&#241';
                        toggleArrow('#arrow_up', 1, 'Start');
                        document.querySelector('#arrow_down > span:nth-child(1)').innerHTML = '&#242';
                        toggleArrow('#arrow_down', 1, 'Start');
                        start = 0;
                        ready = 1;
                    }
                    if (start == 1) {
                        document.querySelector('#arrow_up > span:nth-child(1)').innerHTML = '&#241';
                        toggleArrow('#arrow_up', 1, 'Wait');
                        document.querySelector('#arrow_down > span:nth-child(1)').innerHTML = '&#242';
                        toggleArrow('#arrow_down', 1, 'Wait');
                    }
                    if (start == 1) {
                        document.querySelector('#arrow_up > span:nth-child(1)').classList.remove('Arrow_Bg_Start');
                        document.querySelector('#arrow_down > span:nth-child(1)').classList.remove('Arrow_Bg_Start');
                    }
                    if (start == 5) {
                        document.querySelector('#arrow_up > span:nth-child(1)').classList.remove('Arrow_Bg_Wait');
                        document.querySelector('#arrow_down > span:nth-child(1)').classList.remove('Arrow_Bg_Wait');

                        start = 0;
                        ready = 0;
                    }
                    ////////////////////
                }
            }
        };

        chart = new CanvasJS.Chart('chartContainer', {
            animationEnabled: false,
            theme: 'light2',
            title: {
                titleFontSize: 0,
                text: '',
            },
            toolTip: {
                enabled: true,
                animationEnabled: true,
                borderColor: '#ccc',
                borderThickness: 1,
                fontColor: '#000',
                content: '{y}',
            },
            axisX: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            axisY: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            data: [
                {
                    type: 'line',
                    lineColor: '#ccc',
                    lineThickness: 2,
                    markerType: 'none',
                    markerSize: 6,
                    markerBorderThickness: 0,
                    dataPoints: dps,
                },
            ],
        });

        chart0 = new CanvasJS.Chart('chartContainerAxisCord', {
            animationEnabled: false,
            theme: 'light2',
            title: {
                padding: {
                    right: 0,

                    left: 0,
                },
                titleFontSize: 0,
                text: '',
            },
            toolTip: {
                enabled: true,
                animationEnabled: true,
                borderColor: '#ccc',
                borderThickness: 1,
                fontColor: '#000',
                content: '{y}',
            },
            axisX: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            axisY: {
                stripLines: [
                    {
                        startValue: -0.05,
                        endValue: 0.05,
                        color: 'black',
                    },
                ],
                valueFormatString: '#000',
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            data: [
                {
                    type: 'line',
                    lineColor: '#ccc',
                    lineThickness: 1,
                    markerType: 'none',
                    markerSize: 6,
                    markerBorderThickness: 0,
                    dataPoints: dpsb,
                },
            ],
        });
        chart2 = new CanvasJS.Chart('chartContainerDigitEven', {
            animationEnabled: false,
            theme: 'light2',
            title: {
                padding: {
                    right: 0,

                    left: 0,
                },
                titleFontSize: 0,
                text: '',
            },
            toolTip: {
                enabled: true,
                animationEnabled: true,
                borderColor: '#ccc',
                borderThickness: 1,
                fontColor: '#000',
                content: '{y}',
            },
            axisX: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            dataPointWidth: 10,
            axisY: {
                stripLines: [
                    {
                        startValue: -0.05,
                        endValue: 0.05,
                        color: 'black',
                    },
                ],
                valueFormatString: '#000',
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 0,
            },
            data: [
                {
                    type: 'column',
                    labelFontFamily: 'Arial,sans-serif',
                    lineColor: '#ccc',
                    lineThickness: 0,
                    markerType: 'none',
                    markerSize: 6,
                    markerBorderThickness: 0,
                    dataPoints: dps2,
                },
            ],
        });

        chart3 = new CanvasJS.Chart('chartContainerDigitOdd', {
            animationEnabled: false,
            theme: 'light2',
            title: {
                padding: {
                    right: 0,

                    left: 0,
                },
                titleFontSize: 0,
                text: '',
            },
            toolTip: {
                enabled: true,
                animationEnabled: true,
                color: '#6699FF',
                borderColor: '#ccc',
                borderThickness: 1,
                fontColor: '#000',
                content: '{y}',
            },
            axisX: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            dataPointWidth: 10,
            axisY: {
                stripLines: [
                    {
                        startValue: -0.05,
                        endValue: 0.05,
                        color: 'black',
                    },
                ],
                valueFormatString: '#000',
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            dataPointWidth: 10,
            data: [
                {
                    type: 'column',
                    labelFontFamily: 'Arial,sans-serif',
                    lineColor: '#ccc',
                    markerType: 'none',
                    markerSize: 6,
                    markerBorderThickness: 0,
                    dataPoints: dps3,
                },
            ],
        });

        //////
        chart1 = new CanvasJS.Chart('chartContainerDigit', {
            animationEnabled: false,
            theme: 'light2',
            title: {
                padding: {
                    right: 0,

                    left: 0,
                },
                titleFontSize: 0,
                text: '',
            },
            toolTip: {
                enabled: true,
                animationEnabled: true,
                borderColor: '#ccc',
                borderThickness: 1,
                fontColor: '#000',
                content: '{y}',
            },
            axisX: {
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            axisY: {
                stripLines: [
                    {
                        value: 1,
                        opacity: 50,
                        thickness: 2,
                        color: 'red',
                        value: 100,
                        opacity: 50,
                        thickness: 2,
                        color: 'blue',
                    },
                ],
                valueFormatString: '#000',
                includeZero: false,
                titleFontSize: 0,
                labelFontSize: 0,
                gridThickness: 0,
                tickLength: 0,
                lineThickness: 1,
            },
            dataPointWidth: 10,

            data: [
                {
                    labelFontFamily: 'Arial,sans-serif',
                    type: 'stackedColumn100',
                    lineColor: '#ccc',
                    markerType: 'none',

                    markerBorderThickness: 0,
                    dataPoints: dps1,
                },
                {
                    labelFontFamily: 'Arial,sans-serif',
                    type: 'stackedColumn100',
                    lineColor: '#ccc',
                    markerType: 'none',

                    markerBorderThickness: 0,
                    dataPoints: dps1b,
                },
            ],
        });
    },
    false
);
