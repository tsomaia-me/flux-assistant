Concisely expressive tool with handy utilities for your Flux/Redux applications.

### Installation
> npm install --save flux-assistant

### Prerequisites
Before we start, I assume, that you are familiar with basic concepts of
[Flux](https://facebook.github.io/flux/docs/in-depth-overview)
and [Redux](https://redux.js.org/introduction/core-concepts),
such as [actions](https://facebook.github.io/flux/docs/in-depth-overview#actions)
and [reducers](https://redux.js.org/glossary#reducer).

Also, you should have a look at [Flux Standard Action (FSA)](https://github.com/redux-utilities/flux-standard-action).

> **Important note:** **flux-assistant** is written in TypeScript **with compile time types**, primarily for TypeScript applications.
> If you do use flux-assistant in your JavaScript application,
> consider the fact that **it does not make any runtime type checks**.

### Long story short

Action creators example:

    import { $ } from 'flux-assistant'
    import { Post } from './types'

    const addPost = $('POST_ADD', (post: Post) => post)
    
    const updatePost = $('POST_UPDATE', (post: Post) => post)
    
    const deletePost = $('POST_UPDATE', (post: Post) => post)

    // You may also pass type and payload creator as a record (e.g. for multiline action creators):
    const login = $({
        type: 'USER_LOGIN',
        payload: (username: string, password: string) => ({
             username,
             password,
        })
    })

Reducer example:
    
    import { whenAction, is } from 'flux-assistant'
    import { addPost, updatePost, deletePost } from './actions'
    import { PostsState } from './types'

    const initialState: PostsState = {
        list: []
    }

    export const PostReducer = whenAction<PostsState>(
        is(addPost, (state, action) => ({
            list: [
                action.payload,
                ...state.list,
            ]
        }),
        is(updatePost, (state, action) => ({
            list: state.list.map(p => p !== action.payload ? p : {
                ...p,
                ...action.payload
            }),
        }),
        is(deletePost, (state, action) => ({
            list: state.list.filter(p => p !== action.payload),
        }),
    )(initialState)

### Notes on Flux Standard Action (FSA)
flux-assistant implements a part of FSA, but the rest is avoided for simplicity.

Unlike FSA, flux-assistant actions only have type and payload, so, error actions are created, dispatched and handled separately with their own type.

### Getting started
If you followed the prerequisites section, you should already be familiar with how actions and reducers
are defined and how they work.

In short, in its most simple form, action is a plain object with a single "type" property with a string value, that
should be unique among actions. It looks like this:

    { type: 'SOME_IDENTIFIER' }
    
However, it may have some additional properties, such as payload, error and meta.

It is a good idea to write action types as constants, instead of handcrafting them everytime
we need to dispatch some kind of action or refer to it in our reducers.

It's also a good idea to make [action creators](https://redux.js.org/basics/actions#action-creators)
take responsibility to create actions for you, instead of manually constructing them everytime.

As a result, we get something like this (skipping [selectors](https://read.reduxbook.com/markdown/part1/07-selectors.html)):

    import { AnyAction } from 'flux-assistant'
    import { PostsState, Post } from './types'

    export const POST_ADD = 'POST_ADD'
    
    export const addPost = (post: Post) => ({
        type: POST_ADD,
        payload: post,
    })

    const initialState: PostsState = {
        list: []
    }

    export const PostReducer = (state: PostsState = initialState, action: AnyAction) => {
        switch (action.type) {
            case POST_ADD:
                return {
                    list: [
                        action.payload,
                        ...state.list,
                    ],
                }
                
            default:
                return state
        }
    }

As we add other actions with their corresponding types (such as getPost, updatePost, etc.) and handle them
in the reducer, the file gets bloated soon, so we start splitting them into separate files:
> actionTypes.ts

    export const POST_ADD = 'POST_ADD'
    export const POST_UPDATE = 'POST_UPDATE'
    export const POST_DELETE = 'POST_DELETE'

> actions.ts

    import { POST_ADD, POST_UPDATE, POST_DELETE } from './actionTypes'
    import { Post } from './types'

    export const addPost = (post: Post) => ({
        type: POST_ADD,
        payload: post,
    })

    export const updatePost = (post: Post) => ({
        type: POST_UPDATE,
        payload: post,
    })

    export const deletePost = (post: Post) => ({
        type: POST_DELETE,
        payload: post,
    })

> reducer.ts

    import { AnyAction } from 'flux-assistant'
    import { POST_ADD, POST_UPDATE, POST_DELETE } from './actionTypes'
    import { PostsState } from './types'

    const initialState: PostsState = {
        list: []
    }

    export const PostReducer = (state: PostsState = initialState, action: AnyAction) => {
        switch (action.type) {
            case POST_ADD:
                return {
                    list: [
                        action.payload,
                        ...state.list,
                    ],
                }

            case POST_UPDATE:
                return {
                    list: state.list.map(p => p !== action.payload ? p : {
                        ...p,
                        ...action.payload
                    }),
                }

            case POST_DELETE:
                return {
                    list: state.list.filter(p => p !== action.payload),
                }

            default:
                return state
        }
    }

That is a lot of boilerplate, isn't it?

The fact is, actions and action types are tightly coupled. An action does not make much sense without it's type
and vice-versa. Unlike the example above, in the real world scenarios, we less-likely store our posts only locally,
instead, we send them on the server and retrieve them from it, so, we get even more action types and action creators,
even more imports and exports, even more boilerplate.

So, borrowing idea from [NgRx](https://ngrx.io/guide/store/actions), it gets better when we attach the action types
to the action creators itself:

    import { Post } from './types'

    export const addPost = (post: Post) => ({
        type: addPost.type,
        payload: post,
    })
    addPost.type = 'POST_ADD' as 'POST_ADD'
    
And in a reducer:

    import { AnyAction } from 'flux-assistant'
    imoprt { addPost, ... } from './actions'
    import { PostsState } from './types'

    const initialState: PostsState = {
        list: []
    }
    
    export const PostReducer = (state: PostsState = initialState, action: AnyAction) => {
        switch (action.type) {
            case addPost.type:
                return {
                    ...state,
                    list: [
                        action.payload,
                        ...state.list,
                    ],
                }
 
            case...
        }
    }    
    
 Despite it's better than artificially separating two very related concepts, it's still verbose and not very elegant way
 to implement it.
 So, what flux-assistant does, is it suggests a different way to write actions and reducers:
 > actions.ts
 
    import { $ } from 'flux-assistant'
    import { Post } from './types'

    const addPost = $('POST_ADD', (post: Post) => post)
    
    const updatePost = $('POST_UPDATE', (post: Post) => post)
    
    const deletePost = $('POST_UPDATE', (post: Post) => post)

> reducer.ts
    
    import { AnyAction, whenAction, is } from 'flux-assistant'
    import { addPost, updatePost, deletePost } from './actions'
    import { PostsState } from './types'

    const initialState: PostsState = {
        list: []
    }

    export const PostReducer = whenAction<PostsState>(
        is(addPost, (state, action) => ({
            list: [
                action.payload,
                ...state.list,
            ]
        }),
        is(updatePost, (state, action) => ({
            list: state.list.map(p => p !== action.payload ? p : {
                ...p,
                ...action.payload
            }),
        }),
        is(deletePost, (state, action) => ({
            list: state.list.filter(p => p !== action.payload),
        }),
    )(initialState)
 
 If we want to react to our dollar-actions in, for example, good old switch case style reducer or in some other part,
 we may access it's type directly like so:
 
     addPost.type

We are using redux or another implementation of Flux, whenever we want to combine our reducers
flux-assistant provides it's own implementation of **combineReducers**

    import { PostReducer } from './features/post'
    import { UserReducer } from './features/user'
    import { State } from './types'
    
    export const RootReducer = combineReducers<State>({
        post: PostReducer,
        user: UserReducer,
    })
 
 ### Why $?
Actions are small, yet very important units in Flux/Redux applications.

Do we want to update state?

Do we want to send requests and receive responses?

Do we want our [epics](https://redux-observable.js.org/docs/basics/Epics.html) or
[sagas](https://redux-saga.js.org/docs/introduction/BeginnerTutorial.html) react in some or other way?

Although we may directly refer to some side-effect, otherwise in all of this scenarios we dispatch actions.

Actions are the way different parts of our applications talk to each other.

They are so atomic (or should be), so mainstream and widespread, that the number of action creators our application
defines may increase very rapidly.

Considering all of this, we don't want writing action creators to need much effort.

What we need is some concise and expressive way to easily write them.

What options we have:

- **createActionCreator** - Despite it is expressive, it definitely is not concise, so it doesn't satisfy our need.
- **actionCreator** - It lacks expressiveness and I think, it is kind of lame, isn't it?
- **action** - Despite it is concise, it is not very expressive.
Does it express what it **really does**?
Is this function an action itself (as it is named)?
Does it create action?
In none of the cases answer is positive.
Considering this option, the function to which we refer to with name **action**
actually produces an action creator and that action creator is responsible for creation actual actions.
It is kind of confusing, isn't it?

Dollar ($) functions are not new to JavaScript world. We remember [jQuery](https://jquery.com/), don't we?
In the past, we accessed the DOM using jQuery so frequently that we needed something short, instead of **jQuery()**
and instead of vanillas **document.getElementById** or **document.querySelectorAll**. They were and are much or less
verbose and became a pain to write them each time we needed to do as common operation as accessing the DOM,
as it was in that times. So we get $.

Once we remembered what it does, every other time we didn't have to write
series of many repeating words tens and hundreds of time.
In the present time, we no more access the dom directly - most of the time.
Instead, we dispatch actions and before we do that, we write appropriate action creators for them.
So, as we were making DOM queries with something as short as $ sign,
because that was a very common operation in that times,
why don't we use the exact same sign for the thing that is common nowadays?

Why we shouldn't have some short way for defining something as common as action creators?
So, flux-assistant offers the good old dollar sign for entirely new, but not very less common, purpose.
 