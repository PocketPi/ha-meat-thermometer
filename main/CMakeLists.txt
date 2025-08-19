idf_component_register(SRCS 
    main.c 
    wifi_scan.c 
    wifi_soft_ap.c 
    wifi.c 
    wifi_sta.c
    rest_server.c
    PRIV_REQUIRES esp_wifi nvs_flash  esp_http_server json 
    INCLUDE_DIRS ".") 

set(WEB_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../front/web-app")
if(EXISTS ${WEB_SRC_DIR}/dist)
    littlefs_create_partition_image(www ${WEB_SRC_DIR}/dist FLASH_IN_PROJECT)
else()
    message(FATAL_ERROR "'${WEB_SRC_DIR}/dist' doesn't exist. Please run 'yarn build' under '${WEB_SRC_DIR}'")
endif()