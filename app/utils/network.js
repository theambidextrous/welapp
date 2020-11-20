import conf from "../config/configs";

const apiLogin = (postData) => {
  return fetch(conf.base_api + "users/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      console.log("login issue:: " + error);
      return Promise.reject(error);
    });
};
const apiSignUp = (postData) => {
  return fetch(conf.base_api + "users/new", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiPicUpdate = (xtoken, postData) => {
  return fetch(conf.base_api + "account/update/profile/pic", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer " + xtoken,
    },
    body: postData,
  })
    .then((res) => {
      // console.log(JSON.stringify(res));
      return res.json();
    })
    .catch((error) => {
      // console.log(error);
      return Promise.reject(error);
    });
};
const apiProfileUpdate = (xtoken, postData) => {
  return fetch(conf.base_api + "account/update/profile", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      // console.log(JSON.stringify(res));
      return res.json();
    })
    .catch((error) => {
      // console.log(error);
      return Promise.reject(error);
    });
};
const apiDeviceToken = (xtoken, pushToken) => {
  return fetch(conf.base_api + "account/update/device/" + pushToken, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify({data:null}),
  })
    .then((res) => {
      // console.log(JSON.stringify(res));
      return res.json();
    })
    .catch((error) => {
      // console.log(error);
      return Promise.reject(error);
    });
};
const apiReqReset = (email) => {
  return fetch(conf.base_api + "users/request/reset/" + email, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiVerifyReset = (code, email) => {
  return fetch(conf.base_api + "users/verify/" + code + "/reset/" + email, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiFinishReset = (postData) => {
  return fetch(conf.base_api + "users/finish/reset", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiCourses = (xtoken) => {
  return fetch(conf.base_api + "courses/get/all", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiDropCourse = (course, xtoken) => {
  return fetch(conf.base_api + "courses/drop/" + course, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify({}),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiEnrollCourse = (course, xtoken) => {
  return fetch(conf.base_api + "courses/enroll/" + course, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify({}),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiLessons = (xtoken, unit) => {
  return fetch(conf.base_api + "lessons/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      // console.log(JSON.stringify(res));
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiUnits = (xtoken) => {
  return fetch(conf.base_api + "units/get/all", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiExams = (xtoken, unit) => {
  return fetch(conf.base_api + "exams/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiExamQuestions = (xtoken, exam) => {
  return fetch(conf.base_api + "exams/questions/" + exam, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiMarkChoice = (xtoken, postData) => {
  return fetch(conf.base_api + "exams/progress/mark", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiCompletePaper = (xtoken, postData) => {
  return fetch(conf.base_api + "exams/progress/finish", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiAssignments = (xtoken, unit) => {
  return fetch(conf.base_api + "assignments/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiSubmitAssignments = (xtoken, postData) => {
  return fetch(conf.base_api + "assignments/submit", {
    method: "POST",
    headers: {
      Accept: "multipart/form-data",
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer " + xtoken,
    },
    body: postData,
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiPerformance = (xtoken, unit) => {
  return fetch(conf.base_api + "performance/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiSurveys = (xtoken, unit) => {
  return fetch(conf.base_api + "surveys/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiMarkChoiceSurvey = (xtoken, postData) => {
  return fetch(conf.base_api + "surveys/progress/mark", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiForums = (xtoken, unit) => {
  return fetch(conf.base_api + "forums/get/all/" + unit, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiForumReply = (xtoken, id) => {
  return fetch(conf.base_api + "forums/reply/get/all/" + id, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiReply = (xtoken, postData) => {
  return fetch(conf.base_api + "forums/reply", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body:JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
const apiNewPost = (xtoken, postData) => {
  return fetch(conf.base_api + "forums/post/new", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + xtoken,
    },
    body:JSON.stringify(postData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
export {
  apiLogin,
  apiSignUp,
  apiProfileUpdate,
  apiReqReset,
  apiVerifyReset,
  apiFinishReset,
  apiCourses,
  apiDropCourse,
  apiEnrollCourse,
  apiLessons,
  apiUnits,
  apiExams,
  apiExamQuestions,
  apiAssignments,
  apiPerformance,
  apiSurveys,
  apiForums,
  apiMarkChoice,
  apiCompletePaper,
  apiSubmitAssignments,
  apiMarkChoiceSurvey,
  apiForumReply,
  apiReply,
  apiNewPost,
  apiPicUpdate,
  apiDeviceToken,
};
