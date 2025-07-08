

// Adjust on load and when window resizes
window.addEventListener('load', adjustImagePosition);
window.addEventListener('resize', adjustImagePosition);

function toggleAccordion(titleElement) {
    const accordionItem = titleElement.parentElement;
    accordionItem.classList.toggle('active');

    const content = accordionItem.querySelector('.accordion-content');
    const arrow = titleElement.querySelector('.arrow');

    if (accordionItem.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = null;
        arrow.style.transform = 'rotate(-450deg)';
    }

    setTimeout(adjustImagePosition, 0);
}

const customCursor = document.getElementById('customCursor');

window.addEventListener('mousemove', function(e) {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';
});



