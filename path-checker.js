javascript:(function() {
    let currentPaths = { cssPaths: [], jsPaths: [] }; 
    let modifiedPaths = { cssPaths: [], jsPaths: [] };
    const currentUrl = window.location.href;
    let modifiedUrl;
    let currentHeading;

    if (currentUrl.includes('/kr/')) {
        modifiedUrl = currentUrl.replace('/kr/', '/');
        currentHeading = 'KR';
    } else if (currentUrl.endsWith('/')) {
        modifiedUrl = currentUrl.replace('.com/', '.com/kr/');
        currentHeading = 'US';
    } else {
        modifiedUrl = currentUrl.replace('.com', '.com/kr/');
        currentHeading = 'US';
    }

    const extractPaths = function(doc, type) {
        const paths = [];
        const elements = doc.querySelectorAll(type === 'css' ? 'link[rel="stylesheet"]' : 'script[src]');

        elements.forEach(function(element) {
            const path = type === 'css' ? element.getAttribute('href') : element.getAttribute('src');
            if ((path.startsWith('/v/') || path.startsWith('/kr/')) && path !== '/kr/global/scripts/ac-kr-word-joiner-autorun.js') {
                paths.push(path);

                if (path.includes('/built/')) {
                    const regex = /\/([a-z]+)\/built\/([a-z]+)\//i;
                    const matches = path.match(regex);
                    if (matches && matches.length > 1) {
                        const highlightedText = matches[1];
                        const highlightedPath = path.replace('/' + highlightedText + '/built/', `/<span style="background-color: #ffe91d;">${highlightedText}</span>/built/`);
                        paths[paths.length - 1] = highlightedPath;
                    }
                }
            }
        });

        return paths;
    };

    const createOutputDiv = function() {
        const existingOutputDiv = document.getElementById('outputDiv');
        if (existingOutputDiv) {
            document.body.removeChild(existingOutputDiv);
        }

        const outputDiv = document.createElement('div');
        outputDiv.id = 'outputDiv';
        outputDiv.style = 'position: fixed; top: 0; right: 0; background: rgba(255, 255, 255, 0.9); padding: 12px 18px 15px 15px; margin: 20px 15px; z-index: 999999; color: #444; box-shadow: 5px 5px 5px 0px rgba(68,68,68,0.12); font-family: Verdana; font-size: 15px; border-radius: 16px;';

        const currentPathsDiv = document.createElement('div');
        currentPathsDiv.innerHTML = '<h3>' + currentHeading + '</h3><ul id="currentList"><li>' + currentPaths.cssPaths.join('</li><li>') + '</li><li>' + currentPaths.jsPaths.join('</li><li>') + '</li></ul>';
        
        const modifiedHeading = (modifiedUrl.includes('/kr')) ? 'KR' : 'US';
        const modifiedPathsDiv = document.createElement('div');
        modifiedPathsDiv.innerHTML = '<h3 id="heading">' + modifiedHeading + '</h3><ul id="otherList"><li>' + modifiedPaths.cssPaths.join('</li><li>') + '</li><li>' + modifiedPaths.jsPaths.join('</li><li>') + '</li></ul>';

        const closeButton = document.createElement('button');
        closeButton.innerText = '[Close]';
        closeButton.style.marginTop = '25px';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(outputDiv);
        });

        outputDiv.appendChild(currentPathsDiv);
        outputDiv.appendChild(modifiedPathsDiv);
        outputDiv.appendChild(closeButton);
        document.body.appendChild(outputDiv);

        const currentList = document.getElementById('currentList');
        const otherList = document.getElementById('otherList');
        const heading = document.getElementById('heading');
        currentList.style = 'list-style: none; margin-left: 0; margin-top: 2px';
        otherList.style = 'list-style: none; margin-left: 0; margin-top: 2px';
        heading.style = 'margin-top: 15px';
    };

    const xhr = new XMLHttpRequest();
    xhr.open('GET', modifiedUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const parser = new DOMParser();
                const modifiedDoc = parser.parseFromString(xhr.responseText, 'text/html');
                modifiedPaths.cssPaths = extractPaths(modifiedDoc, 'css');
                modifiedPaths.jsPaths = extractPaths(modifiedDoc, 'js');
            }
            currentPaths.cssPaths = extractPaths(document, 'css');
            currentPaths.jsPaths = extractPaths(document, 'js');
            createOutputDiv();

            if (xhr.status !== 200) {
                const otherList = document.getElementById('otherList');
                otherList.innerHTML = '<li>Page Not Found.</li>';
            };
        }
    };

    xhr.send();
})();
