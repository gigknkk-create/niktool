document.addEventListener('DOMContentLoaded', () => {
    const patternInput = document.getElementById('regex-pattern');
    const testInput = document.getElementById('test-input');
    const flagButtons = document.querySelectorAll('.flag-btn');
    const highlighterLayer = document.getElementById('highlighter-layer');
    const errorDiv = document.getElementById('regex-error');
    const errorMessage = document.getElementById('error-message');
    const matchCountDisplay = document.getElementById('match-count');
    const matchDetailsContainer = document.getElementById('match-details');

    let flags = ['g', 'i'];

    // Handle flag toggles
    flagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const flag = btn.getAttribute('data-flag');
            if (flags.includes(flag)) {
                flags = flags.filter(f => f !== flag);
                btn.classList.remove('bg-blue-600', 'active');
                btn.classList.add('bg-slate-700');
            } else {
                flags.push(flag);
                btn.classList.add('bg-blue-600', 'active');
                btn.classList.remove('bg-slate-700');
            }
            updateRegex();
        });
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateRegex() {
        const pattern = patternInput.value;
        const text = testInput.value;
        
        if (!pattern) {
            highlighterLayer.innerHTML = escapeHtml(text);
            matchCountDisplay.textContent = '0 Matches';
            matchDetailsContainer.innerHTML = '<div class="text-slate-500 italic text-sm text-center py-10">Enter a pattern to see matches</div>';
            errorDiv.classList.add('hidden');
            return;
        }

        try {
            const regex = new RegExp(pattern, flags.join(''));
            errorDiv.classList.add('hidden');

            let matches = [];
            let highlightedText = '';
            let lastIndex = 0;

            if (flags.includes('g')) {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // Prevent infinite loop with zero-length matches
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                    matches.push(match);
                }
            } else {
                const match = text.match(regex);
                if (match) matches.push(match);
            }

            // Build Highlighted HTML
            let offset = 0;
            const escapedText = escapeHtml(text);
            let resultHtml = '';
            
            // We need a clever way to highlight the escaped HTML string
            // Simple approach: work on the original indices but apply to safe string
            let currentPos = 0;
            matches.forEach((match, idx) => {
                const start = match.index;
                const length = match[0].length;
                if (length === 0) return;

                resultHtml += escapeHtml(text.slice(currentPos, start));
                resultHtml += `<span class="match-highlight">${escapeHtml(match[0])}</span>`;
                currentPos = start + length;
            });
            resultHtml += escapeHtml(text.slice(currentPos));
            
            highlighterLayer.innerHTML = resultHtml + (text.endsWith('\n') ? '<br>' : '');
            matchCountDisplay.textContent = `${matches.length} Match${matches.length === 1 ? '' : 'es'}`;
            
            // Update Match Details List
            if (matches.length > 0) {
                matchDetailsContainer.innerHTML = matches.map((match, i) => `
                    <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-blue-400 uppercase">Match ${i + 1}</span>
                            <span class="text-[10px] text-slate-500">Pos: ${match.index}-${match.index + match[0].length}</span>
                        </div>
                        <div class="font-mono text-sm break-all">${escapeHtml(match[0])}</div>
                        ${match.length > 1 ? `
                            <div class="mt-2 pt-2 border-t border-slate-800">
                                <span class="text-[10px] text-slate-500 uppercase block mb-1">Groups</span>
                                ${match.slice(1).map((g, gi) => `
                                    <div class="text-xs font-mono text-slate-400 truncate" title="Group ${gi + 1}: ${g}">
                                        $${gi + 1}: ${escapeHtml(g || 'null')}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                matchDetailsContainer.innerHTML = '<div class="text-slate-500 italic text-sm text-center py-10">No matches found</div>';
            }

        } catch (e) {
            errorDiv.classList.remove('hidden');
            errorMessage.textContent = e.message;
            highlighterLayer.innerHTML = escapeHtml(text);
            matchCountDisplay.textContent = 'Invalid Regex';
        }
    }

    // Sync scroll
    testInput.addEventListener('scroll', () => {
        highlighterLayer.scrollTop = testInput.scrollTop;
        highlighterLayer.scrollLeft = testInput.scrollLeft;
    });

    // Events
    patternInput.addEventListener('input', updateRegex);
    testInput.addEventListener('input', updateRegex);

    // Initial run
    updateRegex();
});