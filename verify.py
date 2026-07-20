from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('file:///app/index.html')

    # Wait for initial load
    page.wait_for_timeout(500)

    # Inject mock detail content to trigger contentObserver
    page.evaluate('''() => {
        const detail = document.getElementById('memory-detail');
        detail.classList.add('show');
        const content = document.getElementById('detail-content');
        content.innerHTML = `
            <div class="detail-actions">
                <div class="detail-action" onclick="console.log('like')"><i class="far fa-heart"></i><span>15</span></div>
                <div class="detail-action active" onclick="console.log('like')"><i class="fas fa-heart"></i><span>16</span></div>
                <div class="detail-action" onclick="console.log('comment')"><i class="far fa-comment"></i><span>5</span></div>
                <div class="detail-action active" onclick="console.log('fav')"><i class="fas fa-star"></i><span>收藏</span></div>
                <div class="detail-action" onclick="console.log('share')"><i class="fas fa-share-alt"></i><span>分享</span></div>
                <div class="detail-action" onclick="console.log('time')"><i class="fas fa-images"></i><span>同框</span></div>
            </div>
            <div class="detail-voice" onclick="console.log('voice')"><i class="fas fa-play-circle"></i><span>语音回忆 (5秒)</span></div>
            <div class="detail-dna-toggle" onclick="console.log('dna')"><i class="fas fa-fingerprint"></i><span>记忆 DNA</span></div>
        `;
    }''')

    # Wait for MutationObserver to process
    page.wait_for_timeout(500)

    # Check attributes
    attributes = page.evaluate('''() => {
        const actions = Array.from(document.querySelectorAll('.detail-action'));
        const voices = Array.from(document.querySelectorAll('.detail-voice'));
        const dnas = Array.from(document.querySelectorAll('.detail-dna-toggle'));
        return {
            actions: actions.map(el => ({
                role: el.getAttribute('role'),
                tabindex: el.getAttribute('tabindex'),
                label: el.getAttribute('aria-label')
            })),
            voices: voices.map(el => ({
                role: el.getAttribute('role'),
                tabindex: el.getAttribute('tabindex')
            })),
            dnas: dnas.map(el => ({
                role: el.getAttribute('role'),
                tabindex: el.getAttribute('tabindex')
            }))
        };
    }''')

    print("Attributes found:")
    print(attributes)

    browser.close()
