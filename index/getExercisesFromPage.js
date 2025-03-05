export const getExercisesFromPage = async (location) => {
    const response = await fetch(location);
    if (!response.ok) {
        throw new Error('Failed to load HTML file');
    }
    const htmlText = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlText, 'text/html');

    const links = htmlDoc.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript:"])');
    const exerciseGroups = {};


    links.forEach(link => {
        const href = link.getAttribute('href');

        if (!href || href.startsWith('#')) return;
        const parts = href.split('/');

        let groupName, exerciseName;

        if (parts.length > 1) {
            if (parts.length >= 3) {
                groupName = parts[0];
                exerciseName = parts[1];
            }
            else {
                groupName = parts[0];
                exerciseName = parts[1].replace('.html', '');
            }
        } else {
            // Fallback 
            groupName = 'Miscellaneous';
            exerciseName = href.replace('.html', '');
        }

        const prettifiedGroupName = prettify(groupName);
        const prettifiedExerciseName = prettify(exerciseName);

        // Initialize group if not exists
        if (!exerciseGroups[groupName]) {
            exerciseGroups[groupName] = {
                title: prettifiedGroupName,
                subtitle: '',
                exercises: []
            };
        }

        exerciseGroups[groupName].exercises.push({
            title: prettifiedExerciseName,
            path: location + href
        });
    });

    const sortedGroups = Object.values(exerciseGroups)
        .map(group => ({
            ...group,
            exercises: group.exercises.sort((a, b) => a.title.localeCompare(b.title))
        }));

    return sortedGroups;
}

const prettify = (str) => {
    return str
        .replace(/_/g, ' ')
        .replace(/%20/g, ' ')
        .replace(/[-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};