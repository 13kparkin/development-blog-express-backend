import { csrfFetch } from "./csrf";

const SET_SEARCH_HISTORY = "searches/setSearchHistory";
const ADD_SEARCH = "searches/addSearch";

const setSearchHistory = (searchHistory) => ({
    type: SET_SEARCH_HISTORY,
    payload: searchHistory,
});

const addSearch = (search) => ({
    type: ADD_SEARCH,
    payload: search,
});

export const getSearchHistory = () => async (dispatch) => {
    const response = await csrfFetch("/api/searches");
    const searchHistory = await response.json();
    dispatch(setSearchHistory(searchHistory));
}

export const createSearch = (search) => async (dispatch) => {
    const response = await csrfFetch("/api/searches", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ search }),
    });
    const newSearch = await response.json();
    dispatch(addSearch(newSearch));
}

const initialState = { searchHistory: {} };

const searchesReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case SET_SEARCH_HISTORY:
            newState = Object.assign({}, state);
            newState.searchHistory = action.payload;
            return newState;
        case ADD_SEARCH:
            newState = Object.assign({}, state);
            newState.searchHistory = action.payload;
            return newState;
        default:
            return state;
    }
}

export default searchesReducer;