const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next)
    }
}


export { asyncHandler }



// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         // console.error("Error from AsyncHandler : ", error);
//         // next(error)
//         res.send(error.code || 500).json({
//             success: false,
//             message: error.message || "Server Error"
//         })
//     }
// }