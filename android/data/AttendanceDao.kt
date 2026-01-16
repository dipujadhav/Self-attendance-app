package com.selfattendance.pro.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM work_profiles")
    fun getAllProfiles(): Flow<List<WorkProfile>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: WorkProfile)

    @Query("SELECT * FROM attendance_records WHERE profileId = :profileId")
    fun getRecordsForProfile(profileId: String): Flow<List<AttendanceRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveRecord(record: AttendanceRecord)

    @Delete
    suspend fun deleteRecord(record: AttendanceRecord)
}