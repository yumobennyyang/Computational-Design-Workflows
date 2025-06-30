// Wait for the whole page to load before adding the event listener
window.onload = function() {
    // Find the button by its ID and add a click event
    document.getElementById('changeButton').addEventListener('click', changeText);
};

// Function that changes the text
function changeText() {
    document.getElementById('demo').textContent = 'You clicked the button!';
}
