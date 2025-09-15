#include "esp_console.h"
#include "esp_log.h"
#include "settings.h"
#include "esp_heap_caps.h"
#include "wifi_scan.h"
#include <string.h>

static const char *TAG = "console";

static char *prvWriteNameToBuffer(char *pcBuffer, const char *pcTaskName) {
    size_t x;

    /* Start by copying the entire string. */
    strcpy(pcBuffer, pcTaskName);

    /* Pad the end of the string with spaces to ensure columns line up when
     * printed out. */
    for (x = strlen(pcBuffer); x < (size_t)(configMAX_TASK_NAME_LEN - 1); x++) {
        pcBuffer[x] = ' ';
    }

    /* Terminate. */
    pcBuffer[x] = (char)0x00;

    /* Return the new end of string. */
    return &(pcBuffer[x]);
}

void task_info_builder(char *pcWriteBuffer) {
    struct task_data {
        char task_name[32];
        char state;
        int priority;
        int cpuid;
        int stack;
        int affinity;
        unsigned long time;
    };

    TaskStatus_t *pxTaskStatusArray;
    int uxArraySize;
    uint32_t ulTotalTime;

    /* Make sure the write buffer does not contain a string. */
    *pcWriteBuffer = (char)0x00;

    /* Take a snapshot of the number of tasks in case it changes while this
     * function is executing. */
    uxArraySize = uxTaskGetNumberOfTasks();

    /* Allocate an array index for each task.  NOTE!  if
     * configSUPPORT_DYNAMIC_ALLOCATION is set to 0 then pvPortMalloc() will
     * equate to NULL. */
    pxTaskStatusArray = pvPortMalloc(uxArraySize * sizeof(TaskStatus_t)); /*lint !e9079 All values returned by pvPortMalloc() have at least the
                                                                             alignment required by the MCU's stack and this allocation allocates a
                                                                             struct that has the alignment requirements of a pointer. */

    /* Generate the (binary) data. */
    uxArraySize = uxTaskGetSystemState(pxTaskStatusArray, uxArraySize, &ulTotalTime);

    struct task_data task_data_array[uxArraySize];

    /* For percentage calculations. */
    ulTotalTime /= 100UL;

    /* Avoid divide by zero errors. */
    if (ulTotalTime > 0UL) {
        if (pxTaskStatusArray != NULL) {
            /* Generate the (binary) data. */
            uxArraySize = uxTaskGetSystemState(pxTaskStatusArray, uxArraySize, NULL);

            /* Create a human readable table from the binary data. */
            for (int x = 0; x < uxArraySize; x++) {
                switch (pxTaskStatusArray[x].eCurrentState) {
                    case eRunning:
                        task_data_array[x].state = 'X';
                        break;

                    case eReady:
                        task_data_array[x].state = 'R';
                        break;

                    case eBlocked:
                        task_data_array[x].state = 'B';
                        break;

                    case eSuspended:
                        task_data_array[x].state = 'S';
                        break;

                    case eDeleted:
                        task_data_array[x].state = 'D';
                        break;

                    case eInvalid: /* Fall through. */
                    default:       /* Should not get here, but it is included
                                    * to prevent static checking errors. */
                        task_data_array[x].state = '?';
                        break;
                }

                strncpy(task_data_array[x].task_name, pxTaskStatusArray[x].pcTaskName, sizeof(task_data_array[x].task_name));

                task_data_array[x].priority = pxTaskStatusArray[x].uxCurrentPriority;
                task_data_array[x].cpuid = (int)pxTaskStatusArray[x].xCoreID == tskNO_AFFINITY ? -1 : pxTaskStatusArray[x].xCoreID;
                task_data_array[x].stack = (int)pxTaskStatusArray[x].usStackHighWaterMark;
                task_data_array[x].affinity = (int)pxTaskStatusArray[x].xTaskNumber;

                /* What percentage of the total run time has the task used?
                 * This will always be rounded down to the nearest integer.
                 * ulTotalRunTime has already been divided by 100. */
                task_data_array[x].time = pxTaskStatusArray[x].ulRunTimeCounter / ulTotalTime;
            }
        }

        for (int i = 0; i < uxArraySize; i++) {
            for (int j = 0; j < uxArraySize; j++) {
                if (task_data_array[i].time > task_data_array[j].time) {
                    struct task_data temp = task_data_array[i];
                    task_data_array[i] = task_data_array[j];
                    task_data_array[j] = temp;
                }
            }
        }

        for (int i = 0; i < uxArraySize; i++) {
            pcWriteBuffer = prvWriteNameToBuffer(pcWriteBuffer, task_data_array[i].task_name);
            sprintf(pcWriteBuffer, "\t%c\t%2u\t%2d\t%u\t%u", task_data_array[i].state, task_data_array[i].priority, task_data_array[i].cpuid, task_data_array[i].stack, task_data_array[i].affinity);
            pcWriteBuffer += strlen(pcWriteBuffer);
            if (task_data_array[i].time > 0) {
                sprintf(pcWriteBuffer, "\t\t%lu%%\r\n", task_data_array[i].time);
            } else {
                sprintf(pcWriteBuffer, "\t\t<1%%\r\n");
            }
            pcWriteBuffer += strlen(pcWriteBuffer);
        }

        /* Free the array again.  NOTE!  If configSUPPORT_DYNAMIC_ALLOCATION
         * is 0 then vPortFree() will be #defined to nothing. */
        vPortFree(pxTaskStatusArray);
    }
}

static int tasks_info(int argc, char **argv) {
    (void)argc;
    (void)argv;

    const size_t bytes_per_task = 128; /* see vTaskList description */
    char *task_list_buffer = malloc(uxTaskGetNumberOfTasks() * bytes_per_task);
    if (task_list_buffer == NULL) {
        printf("failed to allocate buffer for vTaskList output\n");
        return 1;
    }
    fputs("Name                            State\tPrio\tCPU#\tStack\tAffinity\t%Time\n", stdout);
    task_info_builder(task_list_buffer);
    fputs(task_list_buffer, stdout);
    free(task_list_buffer);
    return 0;
}

static void register_tasks(void) {
    const esp_console_cmd_t cmd = {
        .command = "tasks",
        .help = "Get information about running tasks",
        .hint = NULL,
        .func = &tasks_info,
    };
    ESP_ERROR_CHECK(esp_console_cmd_register(&cmd));
}

static int reboot(int argc, char **argv) {
    (void)argc;
    (void)argv;

    printf("Restarting\n");

    esp_restart();
    return ESP_OK;
}

static void register_reboot(void) {
    const esp_console_cmd_t cmd = {
        .command = "reboot",
        .help = "Software reset of the chip",
        .hint = NULL,
        .func = &reboot,
    };
    ESP_ERROR_CHECK(esp_console_cmd_register(&cmd));
}

static int free_mem(int argc, char **argv) {
    (void)argc;
    (void)argv;

    printf("Free Heap: %u bytes\n"
           "  MALLOC_CAP_8BIT      %7u bytes\n"
           "  MALLOC_CAP_DMA       %7u bytes\n"
           "  MALLOC_CAP_SPIRAM    %7u bytes\n"
           "  MALLOC_CAP_INTERNAL  %7u bytes\n"
           "  MALLOC_CAP_DEFAULT   %7u bytes\n"
           "  MALLOC_CAP_IRAM_8BIT %7u bytes\n"
           "  MALLOC_CAP_RETENTION %7u bytes\n",
           xPortGetFreeHeapSize(),
           heap_caps_get_free_size(MALLOC_CAP_8BIT),
           heap_caps_get_free_size(MALLOC_CAP_DMA),
           heap_caps_get_free_size(MALLOC_CAP_SPIRAM),
           heap_caps_get_free_size(MALLOC_CAP_INTERNAL),
           heap_caps_get_free_size(MALLOC_CAP_DEFAULT),
           heap_caps_get_free_size(MALLOC_CAP_IRAM_8BIT),
           heap_caps_get_free_size(MALLOC_CAP_RETENTION));
    return 0;
}

static void register_free(void) {
    const esp_console_cmd_t cmd = {
        .command = "free",
        .help = "Get the current size of free heap memory",
        .hint = NULL,
        .func = &free_mem,
    };
    ESP_ERROR_CHECK(esp_console_cmd_register(&cmd));
}


static int wifi_scan_cmd_func(int argc, char **argv) {
    wifi_ap_record_t ap_info[10];
    int ap_count = wifi_scan(ap_info, 10);
    for (int i = 0; i < ap_count; i++) {
        ESP_LOGI(TAG, "SSID: %s, RSSI: %d", ap_info[i].ssid, ap_info[i].rssi);
    }
    return ESP_OK;
}

static int wifi_set_credentials_cmd_func(int argc, char **argv) {
    ESP_LOGI(TAG, "WiFi connect command");
    if (argc < 2) {
        ESP_LOGE(TAG, "Usage: wifi_set_credentials <ssid> <password> or <clear>");
        return ESP_FAIL;
    }
    if (strcmp(argv[1], "clear") == 0) {
        settings_set_wifi_configured(false);
        ESP_LOGI(TAG, "WiFi configuration cleared");
        return ESP_OK;
    }
    settings_set_wifi_config((uint8_t *)argv[1], strlen(argv[1]) + 1, (uint8_t *)argv[2], strlen(argv[2]) + 1);
    settings_set_wifi_configured(true);
    ESP_LOGI(TAG, "WiFi configuration saved");
    return ESP_OK;
}

static void register_wifi_commands(void) {
    const esp_console_cmd_t wifi_scan_cmd = {
        .command = "wifi_scan",
        .help = "WiFi scan command",
        .hint = NULL,
        .func = &wifi_scan_cmd_func,
    };

    ESP_ERROR_CHECK(esp_console_cmd_register(&wifi_scan_cmd));

    const esp_console_cmd_t wifi_set_credentials_cmd = {
        .command = "wifi_set_credentials",
        .help = "WiFi set credentials command",
        .hint = NULL,
        .func = &wifi_set_credentials_cmd_func,
    };
    
    ESP_ERROR_CHECK(esp_console_cmd_register(&wifi_set_credentials_cmd));
}

static void register_commands(void) {
    register_wifi_commands();
    register_reboot();
    register_free();
    register_tasks();
}

void console_init(void) {
    esp_console_repl_t *repl = NULL;
    esp_console_repl_config_t repl_config = ESP_CONSOLE_REPL_CONFIG_DEFAULT();
    
    register_commands();

    esp_console_dev_usb_cdc_config_t hw_config = ESP_CONSOLE_DEV_CDC_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_console_new_repl_usb_cdc(&hw_config, &repl_config, &repl));

    ESP_ERROR_CHECK(esp_console_start_repl(repl));
}


