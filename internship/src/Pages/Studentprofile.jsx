import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import HeaderforStudent from "../Components/HeaderforStudent";

import "../Styles/StudentProfile.css";

import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
} from "lucide-react";


/* =========================================================
   API + LOCAL STORAGE
========================================================= */

const API_BASE =
  "https://remote-internship-30135.onrender.com";

const TOKEN_KEY = "token";

const STUDENT_PROFILE_KEY =
  "studentProfile";


const StudentProfile = () => {
  const navigate = useNavigate();


  /* =========================================================
     IMAGE PREVIEW
  ========================================================= */

  const [showImagePreview, setShowImagePreview] =
    useState(false);


  /* =========================================================
     GET STORED STUDENT
  ========================================================= */

  const getStoredStudent = () => {
    try {
      const stored =
        localStorage.getItem(
          STUDENT_PROFILE_KEY
        );

      return stored
        ? JSON.parse(stored)
        : {};
    } catch (error) {
      console.error(
        "Failed to read student profile:",
        error
      );

      return {};
    }
  };


  const storedStudent =
    getStoredStudent();


  /* =========================================================
     STUDENT DATA
  ========================================================= */

  const [profile, setProfile] =
    useState(storedStudent);


  /* =========================================================
     EDIT MODE
  ========================================================= */

  const [editMode, setEditMode] =
    useState(false);


  /* =========================================================
     FILES
  ========================================================= */

  const [resumeFile, setResumeFile] =
    useState(null);


  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     EXTRA PROFILE DATA
  ========================================================= */

  const parseArray = (value) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };


  const [extraData, setExtraData] =
    useState({
      phone:
        storedStudent?.phone || "",

      skills:
        parseArray(
          storedStudent?.skills
        ),

      links:
        parseArray(
          storedStudent?.links
        ),

      resume:
        storedStudent?.resume || "",
    });


  /* =========================================================
     INPUT STATES
  ========================================================= */

  const [skillInput, setSkillInput] =
    useState("");

  const [linkInput, setLinkInput] =
    useState("");


  /* =========================================================
     SAVE PROFILE TO LOCAL STORAGE
  ========================================================= */

  const saveProfileToCache = (
    profileData,
    extra = null
  ) => {
    try {
      const currentExtra =
        extra || extraData;

      const cacheData = {
        id: profileData?.id,

        name:
          profileData?.name || "",

        email:
          profileData?.email || "",

        university:
          profileData?.university || "",

        stream:
          profileData?.stream || "",

        branch:
          profileData?.branch || "",

        joiningyear:
          profileData?.joiningyear || "",

        graduatedyear:
          profileData?.graduatedyear || "",

        phone:
          currentExtra?.phone || "",

        skills:
          Array.isArray(
            currentExtra?.skills
          )
            ? JSON.stringify(
                currentExtra.skills
              )
            : currentExtra?.skills || "[]",

        links:
          Array.isArray(
            currentExtra?.links
          )
            ? JSON.stringify(
                currentExtra.links
              )
            : currentExtra?.links || "[]",

        resume:
          currentExtra?.resume || "",

        image:
          profileData?.image || "",
      };


      localStorage.setItem(
        STUDENT_PROFILE_KEY,
        JSON.stringify(
          cacheData
        )
      );
    } catch (error) {
      console.error(
        "Failed to save profile cache:",
        error
      );
    }
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    /*
     * Remove JWT
     */
    localStorage.removeItem(
      TOKEN_KEY
    );

    /*
     * Remove student profile cache
     */
    localStorage.removeItem(
      STUDENT_PROFILE_KEY
    );

    /*
     * Remove other possible
     * authentication data
     */
    localStorage.removeItem("user");
    localStorage.removeItem("student");

    /*
     * Redirect
     */
    navigate("/login", {
      replace: true,
    });
  };


  /* =========================================================
     JWT EXPIRATION
  ========================================================= */

  const getTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    if (!token) {
      return null;
    }

    try {
      const parts =
        token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload =
        JSON.parse(
          atob(
            parts[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

      if (!payload.exp) {
        return null;
      }

      /*
       * JWT exp is seconds.
       * JS Date uses milliseconds.
       */
      return payload.exp * 1000;
    } catch (error) {
      console.error(
        "Invalid JWT:",
        error
      );

      return null;
    }
  };


  /* =========================================================
     CHECK JWT
  ========================================================= */

  const checkTokenExpiration = () => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    /*
     * No token
     */
    if (!token) {
      logout();
      return false;
    }

    const expirationTime =
      getTokenExpiration();

    /*
     * JWT has no exp
     */
    if (!expirationTime) {
      return true;
    }

    /*
     * JWT expired
     */
    if (
      Date.now() >=
      expirationTime
    ) {
      toast.error(
        "Your session has expired. Please login again."
      );

      logout();

      return false;
    }

    return true;
  };


  /* =========================================================
     JWT AUTO LOGOUT TIMER
  ========================================================= */

  const setupTokenExpirationTimer =
    () => {
      const expirationTime =
        getTokenExpiration();

      if (!expirationTime) {
        return null;
      }

      const remainingTime =
        expirationTime -
        Date.now();

      /*
       * Already expired
       */
      if (remainingTime <= 0) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return null;
      }

      /*
       * Logout exactly when JWT expires
       */
      const timer =
        setTimeout(() => {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();
        }, remainingTime);

      return timer;
    };


  /* =========================================================
     UPDATE ALL PROFILE STATE
  ========================================================= */

  const updateProfileCache = (
    updatedProfile,
    updatedExtra
  ) => {
    setProfile(
      updatedProfile
    );

    setExtraData(
      updatedExtra
    );

    saveProfileToCache(
      updatedProfile,
      updatedExtra
    );
  };


  /* =========================================================
     LOAD PROFILE FROM BACKEND
  ========================================================= */

  const loadProfile = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }

    const currentStudent =
      getStoredStudent();

    if (!currentStudent?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      const response =
        await fetch(
          `${API_BASE}/api/students/${currentStudent.id}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );


      /*
       * Unauthorized
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to load profile"
        );
      }


      const data =
        await response.json();


      const newExtraData = {
        phone:
          data.phone || "",

        skills:
          parseArray(
            data.skills
          ),

        links:
          parseArray(
            data.links
          ),

        resume:
          data.resume || "",
      };


      /*
       * Update React state
       */
      setProfile(data);

      setExtraData(
        newExtraData
      );


      /*
       * IMPORTANT:
       * Store freshly fetched profile
       * in localStorage.
       */
      saveProfileToCache(
        data,
        newExtraData
      );
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      toast.error(
        "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD

     FIRST:
       JWT check

     SECOND:
       Check localStorage

     THIRD:
       If cached:
          use cache
          NO API

     FOURTH:
       If not cached:
          GET API ONCE
  ========================================================= */

  useEffect(() => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    /*
     * Setup automatic logout
     */
    const timer =
      setupTokenExpirationTimer();


    /*
     * Check cached profile
     */
    const cachedStudent =
      getStoredStudent();


    if (
      cachedStudent?.id
    ) {
      /*
       * Cached profile exists.
       *
       * Restore it.
       */
      const cachedExtra = {
        phone:
          cachedStudent.phone ||
          "",

        skills:
          parseArray(
            cachedStudent.skills
          ),

        links:
          parseArray(
            cachedStudent.links
          ),

        resume:
          cachedStudent.resume ||
          "",
      };


      setProfile(
        cachedStudent
      );

      setExtraData(
        cachedExtra
      );


      /*
       * IMPORTANT:
       * Do NOT fetch.
       */
      setLoading(false);
    } else {
      /*
       * No cache.
       *
       * Fetch only once.
       */
      loadProfile();
    }


    /*
     * Cleanup
     */
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);


  /* =========================================================
     CHECK JWT WHEN RETURNING TO TAB

     IMPORTANT:
     DOES NOT FETCH PROFILE.
  ========================================================= */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkTokenExpiration();
        }
      };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);


  /* =========================================================
     PROFILE COMPLETION
  ========================================================= */

  const fields = [
    profile.name,
    profile.university,
    profile.branch,
    extraData.phone,
    extraData.resume,
  ];


  const completion =
    Math.round(
      (fields.filter(Boolean)
        .length /
        fields.length) *
        100
    );


  /* =========================================================
     HANDLE PROFILE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    setProfile({
      ...profile,

      [e.target.name]:
        e.target.value,
    });
  };


  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    const updated = {
      name:
        profile.name,

      university:
        profile.university,

      stream:
        profile.stream,

      branch:
        profile.branch,

      joiningyear:
        profile.joiningyear,

      graduatedyear:
        profile.graduatedyear,

      phone:
        extraData.phone,

      skills:
        JSON.stringify(
          extraData.skills
        ),

      links:
        JSON.stringify(
          extraData.links
        ),

      resume:
        extraData.resume,

      image:
        profile.image,
    };


    try {
      /*
       * Optimistic state update
       */
      const optimisticProfile = {
        ...profile,
        ...updated,
      };


      setProfile(
        optimisticProfile
      );


      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                updated
              ),
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to update profile"
        );
      }


      const data =
        await response.json();


      const newExtraData = {
        phone:
          data.phone || "",

        skills:
          parseArray(
            data.skills
          ),

        links:
          parseArray(
            data.links
          ),

        resume:
          data.resume || "",
      };


      /*
       * Update state
       */
      setProfile(data);

      setExtraData(
        newExtraData
      );


      /*
       * IMPORTANT:
       * Update cached profile.
       */
      saveProfileToCache(
        data,
        newExtraData
      );


      setEditMode(false);


      toast.success(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to update profile"
      );
    }
  };


  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload =
    async (e) => {
      /*
       * Check JWT
       */
      if (
        !checkTokenExpiration()
      ) {
        return;
      }


      const file =
        e.target.files?.[0];


      if (!file) {
        return;
      }


      const maxSize =
        2 * 1024 * 1024;


      if (
        file.size >
        maxSize
      ) {
        toast(
          "Image size should be less than 2MB",
          {
            icon: "⚠️",
          }
        );

        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        toast(
          "Only image files allowed",
          {
            icon: "⚠️",
          }
        );

        return;
      }


      try {
        const formData =
          new FormData();


        formData.append(
          "file",
          file
        );


        const token =
          localStorage.getItem(
            TOKEN_KEY
          );


        const response =
          await fetch(
            `${API_BASE}/api/students/${profile.id}/uploadImage`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                formData,
            }
          );


        /*
         * JWT expired
         */
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          toast.error(
            "Your session has expired. Please login again."
          );

          logout();

          return;
        }


        if (!response.ok) {
          throw new Error(
            "Image upload failed"
          );
        }


        const fileName =
          await response.text();


        const updatedProfile = {
          ...profile,

          image:
            fileName,
        };


        /*
         * Update state
         */
        setProfile(
          updatedProfile
        );


        /*
         * Update cache
         */
        saveProfileToCache(
          updatedProfile,
          extraData
        );


        toast.success(
          "Profile photo updated successfully"
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Failed to upload image"
        );
      }
    };


  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/deleteImage`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to remove photo"
        );
      }


      const updatedProfile = {
        ...profile,

        image: "",
      };


      setProfile(
        updatedProfile
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        updatedProfile,
        extraData
      );


      toast.success(
        "Profile photo removed"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to remove photo"
      );
    }
  };


  /* =========================================================
     UPLOAD RESUME
  ========================================================= */

  const uploadResume = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    if (!resumeFile) {
      toast.error(
        "Please select a resume"
      );

      return;
    }


    try {
      const formData =
        new FormData();


      formData.append(
        "file",
        resumeFile
      );


      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/uploadResume`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              formData,
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Resume upload failed"
        );
      }


      const fileName =
        await response.text();


      const updatedExtraData = {
        ...extraData,

        resume:
          fileName,
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      setResumeFile(null);


      toast.success(
        "Resume uploaded successfully"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to upload resume"
      );
    }
  };


  /* =========================================================
     VIEW RESUME
  ========================================================= */

  const viewResume = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/resume/${extraData.resume}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to load resume"
        );
      }


      const blob =
        await response.blob();


      const url =
        URL.createObjectURL(
          blob
        );


      window.open(
        url,
        "_blank"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Unable to open resume"
      );
    }
  };


  /* =========================================================
     DELETE RESUME
  ========================================================= */

  const deleteResume = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/deleteResume`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to delete resume"
        );
      }


      const updatedExtraData = {
        ...extraData,

        resume: "",
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      toast.success(
        "Resume deleted successfully"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to delete resume"
      );
    }
  };


  /* =========================================================
     ADD SKILL
  ========================================================= */

  const addSkill = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    const skill =
      skillInput.trim();


    if (!skill) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/add-skill?skill=${encodeURIComponent(skill)}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to add skill"
        );
      }


      const updatedSkills = [
        ...extraData.skills,
        skill,
      ];


      const updatedExtraData = {
        ...extraData,

        skills:
          updatedSkills,
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      setSkillInput("");


      toast.success(
        "Skill added"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to add skill"
      );
    }
  };


  /* =========================================================
     DELETE SKILL
  ========================================================= */

  const deleteSkill = async (
    skill,
    index
  ) => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/delete-skill?skill=${encodeURIComponent(skill)}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to delete skill"
        );
      }


      const updatedSkills =
        extraData.skills.filter(
          (_, i) =>
            i !== index
        );


      const updatedExtraData = {
        ...extraData,

        skills:
          updatedSkills,
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      toast.success(
        "Skill removed"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to remove skill"
      );
    }
  };


  /* =========================================================
     ADD LINK
  ========================================================= */

  const addLink = async () => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    const link =
      linkInput.trim();


    if (!link) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/add-link?link=${encodeURIComponent(link)}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to add link"
        );
      }


      const updatedLinks = [
        ...extraData.links,
        link,
      ];


      const updatedExtraData = {
        ...extraData,

        links:
          updatedLinks,
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      setLinkInput("");


      toast.success(
        "Link added"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to add link"
      );
    }
  };


  /* =========================================================
     DELETE LINK
  ========================================================= */

  const deleteLink = async (
    link,
    index
  ) => {
    /*
     * Check JWT
     */
    if (
      !checkTokenExpiration()
    ) {
      return;
    }


    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );


      const response =
        await fetch(
          `${API_BASE}/api/students/${profile.id}/delete-link?link=${encodeURIComponent(link)}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      /*
       * JWT expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        logout();

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Failed to delete link"
        );
      }


      const updatedLinks =
        extraData.links.filter(
          (_, i) =>
            i !== index
        );


      const updatedExtraData = {
        ...extraData,

        links:
          updatedLinks,
      };


      setExtraData(
        updatedExtraData
      );


      /*
       * Update cache
       */
      saveProfileToCache(
        profile,
        updatedExtraData
      );


      toast.success(
        "Link removed"
      );
    } catch (error) {
      console.error(
        error
      );

      toast.error(
        "Failed to remove link"
      );
    }
  };


  /* =========================================================
     IMAGE URL
  ========================================================= */

  const DEFAULT_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";


  const imageSrc =
    profile?.image &&
    profile.image !== "default"
      ? profile.image.startsWith(
          "data:"
        )
        ? profile.image
        : `${API_BASE}/api/students/image/${encodeURIComponent(
            profile.image
          )}`
      : DEFAULT_IMAGE;


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="sd-layout">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="sd-sidebar">

          <nav className="sd-nav">

            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                navigate(
                  "/student-dashboard"
                )
              }
            />


            <NavButton
              icon={Search}
              label="Browse Internships"
              onClick={() =>
                navigate(
                  "/browse-internships"
                )
              }
            />


            <NavButton
              icon={FileText}
              label="My Applications"
              onClick={() =>
                navigate(
                  "/myapplications"
                )
              }
            />


            <NavButton
              icon={ClipboardList}
              label="My Tasks"
              onClick={() =>
                navigate(
                  "/mytasks"
                )
              }
            />


            <NavButton
              icon={MessageSquare}
              label="Feedback"
              onClick={() =>
                navigate(
                  "/feedback"
                )
              }
            />


            <NavButton
              active
              icon={User}
              label="Profile"
              onClick={() =>
                navigate(
                  "/student-profile"
                )
              }
            />

          </nav>

        </aside>


        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="sd-main">


          {/* =================================================
              LOADER
          ================================================= */}

          {loading ? (

            <div className="sd-loader">

              <div className="sd-spinner"></div>

              <p>
                Loading your profile…
              </p>

            </div>

          ) : (

            <>


              {/* =============================================
                  PROFILE HEADER
              ============================================= */}

              <div className="profile-header">

                <div>

                  <h1>
                    {profile.name ||
                      "Student"}'s Profile
                  </h1>

                  <p>
                    Manage your complete
                    profile
                  </p>

                </div>


                {/* Completion */}

                <div className="dashboard-card">

                  <h2>
                    Profile Completion
                  </h2>


                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${completion}%`,
                      }}
                    />

                  </div>


                  <p className="progress-text">

                    {completion}%
                    Complete

                  </p>

                </div>


                {/* Edit / Save */}

                {!editMode ? (

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setEditMode(
                        true
                      )
                    }
                  >
                    Edit Profile
                  </button>

                ) : (

                  <button
                    className="primary-btn"
                    onClick={
                      handleSave
                    }
                  >
                    Save Changes
                  </button>

                )}

              </div>


              {/* =============================================
                  PROFILE + ACADEMIC DETAILS
              ============================================= */}

              <div className="profile-container">


                {/* ===========================================
                    PROFILE CARD
                =========================================== */}

                <div className="profile-card">

                  <img
                    src={imageSrc}
                    alt="profile"
                    style={{
                      cursor:
                        "pointer",
                    }}
                    onClick={() =>
                      setShowImagePreview(
                        true
                      )
                    }
                  />


                  <h2>
                    {profile.name ||
                      "Student"}
                  </h2>


                  <p>
                    {profile.email ||
                      "student@gmail.com"}
                  </p>


                  {/* Image Upload */}

                  {editMode && (
                    <>

                      <div className="image-dropzone">

                        <p>
                          Drag & Drop
                          Image or Click
                          Below
                        </p>


                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleImageUpload
                          }
                        />

                      </div>


                      {profile.image && (

                        <button
                          className="delete-btn"
                          onClick={
                            removeImage
                          }
                        >
                          Remove Photo
                        </button>

                      )}

                    </>
                  )}

                </div>


                {/* ===========================================
                    ACADEMIC DETAILS
                =========================================== */}

                <div className="profile-details">

                  <h3>
                    🎓 Academic Details
                  </h3>


                  {[
                    "name",
                    "university",
                    "stream",
                    "branch",
                  ].map(
                    (field) => (

                      <div
                        key={field}
                        className="profile-row"
                      >

                        <label>
                          {field}
                        </label>


                        {editMode ? (

                          <input
                            name={field}
                            value={
                              profile[
                                field
                              ] || ""
                            }
                            onChange={
                              handleChange
                            }
                          />

                        ) : (

                          <span>
                            {
                              profile[
                                field
                              ] ||
                              "N/A"
                            }
                          </span>

                        )}

                      </div>

                    )
                  )}


                  <h3
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    📅 Timeline
                  </h3>


                  {[
                    "joiningyear",
                    "graduatedyear",
                  ].map(
                    (field) => (

                      <div
                        key={field}
                        className="profile-row"
                      >

                        <label>
                          {field}
                        </label>


                        {editMode ? (

                          <input
                            name={field}
                            value={
                              profile[
                                field
                              ] || ""
                            }
                            onChange={
                              handleChange
                            }
                          />

                        ) : (

                          <span>
                            {
                              profile[
                                field
                              ] ||
                              "N/A"
                            }
                          </span>

                        )}

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =============================================
                  PERSONAL INFORMATION
              ============================================= */}

              <div className="dashboard-card">

                <h2>
                  Personal Information
                </h2>


                <p>
                  📧{" "}
                  {profile.email ||
                    "N/A"}
                </p>


                {editMode ? (

                  <input
                    value={
                      extraData.phone
                    }
                    placeholder="Phone number"
                    onChange={(e) =>
                      setExtraData({
                        ...extraData,
                        phone:
                          e.target.value,
                      })
                    }
                  />

                ) : (

                  <p>
                    📱{" "}
                    {extraData.phone ||
                      "N/A"}
                  </p>

                )}

              </div>


              {/* =============================================
                  RESUME
              ============================================= */}

              <div className="dashboard-card">

                <h2>
                  Resume
                </h2>


                {editMode && (

                  <div className="quick-actions-row">

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setResumeFile(
                          e.target
                            .files?.[0] ||
                            null
                        )
                      }
                    />


                    <button
                      onClick={
                        uploadResume
                      }
                      className="primary-btn"
                    >
                      Upload
                    </button>

                  </div>

                )}


                {extraData.resume ? (

                  <div className="resume-card">

                    <p>
                      {
                        extraData.resume
                      }
                    </p>


                    <div>

                      <button
                        onClick={
                          viewResume
                        }
                        className="view-btn"
                      >
                        View Resume
                      </button>


                      {editMode && (

                        <button
                          className="delete-btn"
                          onClick={
                            deleteResume
                          }
                        >
                          Delete
                        </button>

                      )}

                    </div>

                  </div>

                ) : (

                  <p>
                    No resume uploaded yet.
                  </p>

                )}

              </div>


              {/* =============================================
                  SKILLS
              ============================================= */}

              <div className="dashboard-card">

                <h2>
                  Skills
                </h2>


                {editMode && (

                  <div className="quick-actions-row">

                    <input
                      value={
                        skillInput
                      }
                      placeholder="Enter a skill"
                      onChange={(e) =>
                        setSkillInput(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          e.preventDefault();

                          addSkill();
                        }
                      }}
                    />


                    <button
                      className="secondary-btn"
                      onClick={
                        addSkill
                      }
                    >
                      Add
                    </button>

                  </div>

                )}


                {extraData.skills
                  .length === 0 ? (

                  <p>
                    No skills added yet.
                  </p>

                ) : (

                  <div>

                    {extraData.skills.map(
                      (
                        skill,
                        index
                      ) => (

                        <span
                          key={`${skill}-${index}`}
                          className="skill-chip"
                        >

                          {skill}


                          {editMode && (

                            <button
                              className="delete-btn"
                              style={{
                                marginLeft:
                                  "8px",
                                padding:
                                  "2px 6px",
                              }}
                              onClick={() =>
                                deleteSkill(
                                  skill,
                                  index
                                )
                              }
                            >
                              ×
                            </button>

                          )}

                        </span>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* =============================================
                  LINKS
              ============================================= */}

              <div className="dashboard-card">

                <h2>
                  Links
                </h2>


                {editMode && (

                  <div className="quick-actions-row">

                    <input
                      value={
                        linkInput
                      }
                      placeholder="Enter portfolio, GitHub, LinkedIn, etc."
                      onChange={(e) =>
                        setLinkInput(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          e.preventDefault();

                          addLink();
                        }
                      }}
                    />


                    <button
                      className="secondary-btn"
                      onClick={
                        addLink
                      }
                    >
                      Add
                    </button>

                  </div>

                )}


                {extraData.links
                  .length === 0 ? (

                  <p>
                    No links added yet.
                  </p>

                ) : (

                  extraData.links.map(
                    (
                      link,
                      index
                    ) => (

                      <div
                        key={`${link}-${index}`}
                        className="link-item"
                      >

                        <p>
                          {link}
                        </p>


                        {editMode && (

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteLink(
                                link,
                                index
                              )
                            }
                          >
                            Delete
                          </button>

                        )}

                      </div>

                    )
                  )

                )}

              </div>


              {/* =============================================
                  IMAGE PREVIEW
              ============================================= */}

              {showImagePreview && (

                <div
                  className="image-preview-overlay"
                  onClick={() =>
                    setShowImagePreview(
                      false
                    )
                  }
                >

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowImagePreview(
                        false
                      );
                    }}
                    style={{
                      position:
                        "absolute",

                      top: "20px",

                      right: "20px",

                      background:
                        "rgba(255,255,255,0.2)",

                      border:
                        "none",

                      color:
                        "#fff",

                      fontSize:
                        "22px",

                      cursor:
                        "pointer",

                      padding:
                        "8px 12px",

                      borderRadius:
                        "50%",
                    }}
                  >
                    ✕
                  </button>


                  <img
                    src={imageSrc}
                    alt="preview"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  />

                </div>

              )}

            </>

          )}

        </main>

      </div>
    </>
  );
};


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`sd-nav-button ${
        active
          ? "active"
          : ""
      }`}
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
      }
    >

      <Icon size={20} />

      <span>
        {label}
      </span>

    </button>
  );
}


export default StudentProfile;