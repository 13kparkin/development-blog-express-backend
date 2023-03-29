import "./SinglePost.css";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { getSinglePost, getAllPosts } from "../../../store/posts";
import { useHistory, useParams } from "react-router-dom";
import { timeConverter } from "../../../utils/time";
import { getGptMessages } from "../../../store/gpt";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const SinglePost = () => {
  const dispatch = useDispatch();
  const singlePostObj = useSelector((state) => state.posts?.singlePost?.post);
  const history = useHistory();
  const { postId } = useParams();
  const [gptPushed, setgptPushed] = useState(false);
  const [question, setQuestion] = useState("");
  const [gptMessageHistory, setGptMessageHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countDown, setCountDown] = useState(15);
  const [error, setError] = useState([]);

  const [gptAnswers, setGptAnswers] = useState("");

  const gptMessages = useSelector(
    (state) => state.getGptMessages?.getGptMessages
  );

  const getGptMessagesData = async (data, question) => {
    const gptMessages = await dispatch(getGptMessages(data, question));
    return gptMessages;
  };

  const chatSendPushed = async (e) => {
    e.preventDefault();
    setError([]);
    setgptPushed(true);
    setIsLoading(true);
    setTimeout(() => setgptPushed(false), 200);
    setQuestion(question);
    const articleString = ` ${singlePostObj?.title} \n ${singlePostObj?.body} \n ${singlePostObj?.User?.username}`;

    // Timeout for lagged server
    const timer = setTimeout(() => {
      setError(["The server is taking too long to respond. Please try again."]);
      const newMessage = { question, answer: answers?.final?.everythingFound };
      setGptMessageHistory([newMessage, ...gptMessageHistory]);
      setQuestion("");
      setIsLoading(false);
    }, 15000);
    
    const answers = await getGptMessagesData(articleString, question);
    setGptAnswers(answers);
    clearTimeout(timer);
    if (answers?.final?.everythingFound.length === 0) {
      setError(["No answer found. Please try again."]);
    }
    // Update message history state with new question and answer
    const newMessage = { question, answer: answers?.final?.everythingFound };
    setGptMessageHistory([newMessage, ...gptMessageHistory]);
    setQuestion("");
    setIsLoading(false);
  };

  const handleFieldChange = (e) => {
    setQuestion(e.target.value);
  };

  useEffect(() => {
    const getSinglePostData = async () => {
      const posts = await dispatch(getSinglePost(postId));
    };
    getSinglePostData();
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => {
        if(countDown > 0){
          setCountDown(countDown - 1);
        }
      }, 1000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, countDown, isLoading, postId]);

  useEffect(() => {
    if (isLoading === false) {
      setCountDown(15);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error.length > 0) {
      setIsLoading(false);
    }
  }, [error]);



  return (
    <>
      <form onSubmit={chatSendPushed} className="single-post-chat-container">
        <div className="single-post-chat">
          <div className="single-post-chat-title"></div>
          <div className="single-post-chat-input">
            <input
              type="text"
              placeholder="Type your message here"
              value={question}
              onChange={handleFieldChange}
            />
            <button
              className={gptPushed ? "gptPushed" : ""}
              onClick={chatSendPushed}
              disabled={gptPushed}
            >
              {isLoading ? <span className="loader"></span> : "Send"}
              {isLoading && <span className="countdown">{countDown}</span>}
            </button>
          </div>
          <div className="single-post-chat-response">
            {error &&
              error?.map((error, index) => (
                <div key={index} className="single-post-chat-response-error">
                  {error}
                </div>
              ))}
            {gptMessageHistory?.map((message, index) => (
              <div key={index} className="single-post-chat-response-message">
                <div className="single-post-chat-response-question">
                  {message?.question}
                </div>
                {message?.answer?.map((answer, index) => (
                  <div key={index} className="single-post-chat-response-answer">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </form>
      <div className="single-post-container">
        <div className="single-post">
          <div className="single-post-image">
            <ReactMarkdown>
              {singlePostObj?.PostsImages?.[0]?.url}
            </ReactMarkdown>
          </div>
          <div className="user-info">
            <div className="username">{singlePostObj?.User?.username}</div>
          </div>
          <div className="single-post-updateAt">
            {timeConverter(singlePostObj?.updatedAt)}
          </div>
          <div className="single-post-title">{singlePostObj?.title}</div>
          <div className="single-post-body">
            <ReactMarkdown
                      className="single-post-body"
                      children={singlePostObj?.body}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              children={String(children).replace(/\n$/, "")}
                              style={atomDark} // theme
                              language={match[1]}
                              PreTag="section" // parent tag
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    />
          </div>
        </div>
      </div>
    </>
  );
};

export default SinglePost;
