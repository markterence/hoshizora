const originalStargazersTestData = {
    "id": "someRandomID",
    "name": "some-name",
    "stargazerCount": 43,
    "stargazers": {
        "nodes": [
            {
                "avatarUrl": "https://picsum.photos/id/1005/100/100.jpg",
                "login": "randomuser123"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1002/100/100.jpg",
                "login": "johnsmith"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1001/100/100.jpg",
                "login": "johndoe"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1004/100/100.jpg",
                "login": "janedoe"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1006/100/100.jpg",
                "login": "testuser"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1009/100/100.jpg",
                "login": "user789"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1010/100/100.jpg",
                "login": "user456"
            },
            {
                "avatarUrl": "https://picsum.photos/id/1011/100/100.jpg",
                "login": "user123"
            }
        ]
    },
    "forkCount": 3
};

const longNamesStargazersTestData = () => { 
    const longNames = [
        "thisisaverylongusernamethatshouldtestthewrappingfunctionality",
        "anotherextremelylongusernameforcheckingthetextwrappingcapabilities",
        "shortname",
        "mediumlengthname",
        "averyveryverylongusernameindeedjusttotestthelimits",
        "tiny",
        "thisnameisjustlongenoughtotestthewrappingfeatureproperly",
        "lastlongusernamefortestingpurposesonly"
    ];

    const modifiedData = { ...originalStargazersTestData };
    modifiedData.stargazers.nodes = modifiedData.stargazers.nodes.map((node, index) => ({
        ...node,
        login: longNames[index] || node.login
    }));

    return modifiedData;
}

export { originalStargazersTestData, longNamesStargazersTestData };