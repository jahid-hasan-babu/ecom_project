// import { parentPort, workerData, isMainThread } from "worker_threads";
// import { fileUploader } from "./fileUploader";
// import prisma from "../lib/prisma";

// async function uploadVideosAndUpdate(courseId: string, lessons: any[]) {
//   for (const lesson of lessons) {
//     if (lesson.file) {
//       const uploadResult = await fileUploader.uploadToDigitalOcean(lesson.file);

//       // update lesson in DB after upload
//       await prisma.lesson.update({
//         where: { id: lesson.id },
//         data: { videoUrl: uploadResult.Location },
//       });
//     }
//   }
// }

// if (!isMainThread) {
//   (async () => {
//     try {
//       const { courseId, lessons } = workerData;
//       await uploadVideosAndUpdate(courseId, lessons);

//       parentPort?.postMessage({ success: true });
//     } catch (error: any) {
//       parentPort?.postMessage({ success: false, error: error.message });
//     }
//   })();
// }

// export default uploadVideosAndUpdate;


import { parentPort, workerData, isMainThread } from "worker_threads";
import { fileUploader } from "./fileUploader";
import prisma from "../lib/prisma";

async function uploadVideosAndUpdate(courseId: string, lessons: any[]) {
  for (const lesson of lessons) {
    if (lesson.file) {
      const uploadResult = await fileUploader.uploadToDigitalOcean(lesson.file);

      // Update lesson in DB after upload
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoUrl: uploadResult.Location },
      });
    }
  }
}

if (!isMainThread) {
  (async () => {
    try {
      const { courseId, lessons } = workerData;
      await uploadVideosAndUpdate(courseId, lessons);

      parentPort?.postMessage({ success: true });
    } catch (error: any) {
      parentPort?.postMessage({ success: false, error: error.message });
    }
  })();
}

export default uploadVideosAndUpdate;
